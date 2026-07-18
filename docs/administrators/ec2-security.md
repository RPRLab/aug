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
| IAM role and instance profile | `rprlab-ec2-research-instance-role` | Gives EC2 instances the permissions required to register with Systems Manager |
| AWS managed policy            | `AmazonSSMManagedInstanceCore`      | Supplies the core Systems Manager managed-node permissions                    |
| EC2 security group            | `rprlab-session-manager-only`       | Allows no inbound traffic and currently retains the default outbound access   |

The role is for EC2 workloads, not human identities. Researchers receive permission to pass only this approved role to EC2 through the inline policy documented under [Organization structure](../administrators/org-structure.md#researcheraccess-inline-permissions).

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

1. Open **IAM > Roles** and choose **Create role**.

2. Select **AWS service** with the **EC2** use case.

3. Attach `AmazonSSMManagedInstanceCore`.

4. Name the role `rprlab-ec2-research-instance-role` and confirm that an instance profile of the same name is available.

5. Update the researcher `iam:PassRole` policy if the role ARN changes.

To recreate the security group:

1. Open **EC2 > Network & Security > Security Groups** in the `research` account and correct VPC.

2. Create `rprlab-session-manager-only`.

3. Leave inbound rules empty.

4. Retain outbound HTTPS connectivity required for Systems Manager. If outbound rules are restricted, validate the required service endpoints before deploying the change.

5. Update every approved launch-template version that referenced the previous security-group ID.
