---
icon: lucide/shield-check
tags:
  - EC2
  - IAM
  - Session Manager
  - Security
---

# EC2 access and network security

Systems Manager Session Manager is the default supported method for connecting to lab EC2 instances. It provides authenticated shell access through IAM without opening inbound ports or distributing SSH keys.

Approved AMIs and launch templates must be configured to use Session Manager and no-inbound network access.

## Standard resources

The following shared resources are maintained in the `research` account:

| Resource                      | Name                                | Purpose                                                                       |
| ----------------------------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| IAM role and instance profile | `rprlab-ec2-research-instance-role` | Gives EC2 instances Systems Manager access and read/write access to the research bucket |
| AWS managed policy            | `AmazonSSMManagedInstanceCore`      | Supplies the core Systems Manager managed-node permissions                    |
| Customer managed policy       | `rprlab-ec2-research-s3-read-write` | Allows listing, reading, and writing throughout the research bucket, including multipart uploads |
| EC2 security group            | `rprlab-session-manager-only`       | Allows no inbound traffic and currently retains the default outbound access   |

The role is for EC2 workloads, not human identities. Researchers receive permission to pass only this approved role to EC2 through the inline policy documented under [Organization structure](../administrators/org-structure.md#researcheraccess-inline-permissions).

## Research bucket access

The shared EC2 role can list, download, upload, and overwrite objects anywhere in `rprlab-research-376129434881-eu-north-1-an`. This includes `projects/`, `shared/`, `shared/databases/`, `users/`, and any existing objects outside those prefixes. Continue to follow the [standard storage layout](resource-standards.md#s3-is-long-term-shared-storage) when creating data.

Every existing or future instance using this role receives these permissions. `Owner` and `Project` tags and S3 prefixes organize resources; they do not restrict this role to a particular researcher or project. Use the shared role only for workloads trusted with the whole research bucket. Coordinate changes to shared data with its maintainers.

The S3 policy grants data access to this bucket only. It does not grant object deletion, ACL changes, bucket administration, or access to other buckets. Uploading to an existing key can overwrite its contents even without delete permission. S3-to-S3 `mv`, `rm`, and uploads using `sync --delete` require deletion permissions that this role does not have.

Attach the following customer managed policy, named `rprlab-ec2-research-s3-read-write`, alongside `AmazonSSMManagedInstanceCore`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListResearchBucket",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:ListBucketMultipartUploads"
      ],
      "Resource": "arn:aws:s3:::rprlab-research-376129434881-eu-north-1-an"
    },
    {
      "Sid": "ReadWriteResearchObjects",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": "arn:aws:s3:::rprlab-research-376129434881-eu-north-1-an/*"
    }
  ]
}
```

Keep the role's trust limited to EC2 and retain the existing researcher `iam:PassRole` restriction. Changing the attached S3 policy does not require rebuilding an AMI or replacing a launch template that already selects this instance profile. Allow IAM changes time to propagate before testing from an existing instance.

For same-account access, this role policy normally supplies the S3 permission without adding a bucket policy. Other explicit denies still apply. Objects encrypted with an AWS KMS key additionally require the appropriate key permissions; this S3 policy grants no KMS permissions.

### Checking the identity used by a workload

An SSO login on a researcher's laptop and the role used by an EC2 workload are separate identities. Run the following in the same shell or environment as a failing transfer:

```sh title="shell"
aws sts get-caller-identity
```

An instance using the shared role should report an ARN beginning with `arn:aws:sts::376129434881:assumed-role/rprlab-ec2-research-instance-role/`. If it reports a different identity, check the selected AWS profile, credential environment variables, and attached instance profile. Do not put personal credentials into an AMI to work around missing workload permissions.

Validate access with a small upload to a new key under the responsible researcher's `users/<username>/` prefix, then list and download it. Test overwrites only against that disposable test object. Have an authorized human remove the test object afterward; the worker role cannot delete it.

## Required launch configuration

For approved instances and launch templates:

- choose **Proceed without a key pair**;

- select the `rprlab-session-manager-only` security group;

- select `rprlab-ec2-research-instance-role` as the IAM instance profile;

- use an image with a supported SSM Agent installed and running;

- configure temporary EBS volumes to delete on termination; and

- apply the required `Owner` and `Project` tags.

Session Manager does not require an inbound security-group rule. The instance does require outbound HTTPS connectivity to the Systems Manager service endpoints.

## Recreating the shared resources

These resources already exist. Recreate or replace them only as part of a reviewed recovery or infrastructure change.

To recreate the IAM role and instance profile in the `research` account:

1. Open [IAM > Roles](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/iam/home#/roles) and choose **Create role**.

2. Select **AWS service** with the **EC2** use case.

3. Attach `AmazonSSMManagedInstanceCore` and the customer managed `rprlab-ec2-research-s3-read-write` policy. If the latter is missing, recreate it from the [policy above](#research-bucket-access).

4. Name the role `rprlab-ec2-research-instance-role` and confirm that an instance profile of the same name is available.

5. Update the researcher `iam:PassRole` policy if the role ARN changes.

To recreate the security group:

1. Open [EC2 > Network & Security > Security Groups](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#SecurityGroups:) in the `research` account and correct VPC.

2. Create `rprlab-session-manager-only`.

3. Leave inbound rules empty.

4. Retain outbound HTTPS connectivity required for Systems Manager. If outbound rules are restricted, validate the required service endpoints before deploying the change.

5. Update every approved launch-template version that referenced the previous security-group ID.
