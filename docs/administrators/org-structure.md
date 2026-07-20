---
icon: lucide/boxes
tags:
  - Organizations
  - IAM
  - Permissions
---

# Organization structure, groups, and permissions

## Accounts

AWS accounts provide security, billing, and resource boundaries. The lab organization currently separates organization administration from research workloads:

| Account    | Purpose                                                                                                                      | Must not contain                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `rprlab`   | Management account for AWS Organizations, IAM Identity Center, consolidated billing, budgets, and organization-wide controls | Research EC2 instances, project data, application AMIs, or ordinary workloads |
| `research` | Member account for EC2, EBS, S3, application AMIs, and other research resources                                              | Organization management configuration                                         |

Each account uses a lab-controlled root recovery mailbox. The exact addresses and recovery credentials are not recorded here, but should be known by all [Owners](../index.md#aws-owners). If you know these credentials, you are effectively an [Owner](../index.md#aws-owners).

!!!Failure "Do not use root credentials for routine work"

    Owners must instead use IAM Identity Center and temporary role credentials, as with other research or administrative tasks. Root access is reserved for tasks that explicitly require it.

## Centralizing IAM Identity Center

The lab keeps users and account access centrally managed through one organization instance of IAM Identity Center in the `rprlab` account. This service control policy (SCP) prevents member accounts such as `research` from creating separate Identity Center instances.

To create and attach the guardrail:

1.  Navigate to [AWS Organizations > Policies > Service control policies](https://986542260596-qogog24k.us-east-1.console.aws.amazon.com/organizations/v2/home/policies/service-control-policy). If service control policies are not yet enabled, choose **Enable service control policies**.

2.  Choose **Create policy**.

3.  On the **Create new service control policy** page, enter: **Policy name:** `DenyMemberAccountInstances` and **Policy description:** `Prevent creation of new account instances of IAM Identity Center`

4.  Replace the policy editor's contents with the following, and choose **Create policy**:

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "DenyMemberAccountInstances",
          "Effect": "Deny",
          "Action": "sso:CreateInstance",
          "Resource": "*"
        }
      ]
    }
    ```

5.  On the new `DenyMemberAccountInstances` policy page, open the **Targets** tab and choose **Attach**.

6.  Select the organization root at the top of the account hierarchy and choose **Attach policy**.

See AWS's guidance on [using SCPs to control account-instance creation](https://docs.aws.amazon.com/singlesignon/latest/userguide/control-account-instance.html) and [attaching organization policies](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_policies_attach.html) for the supported workflows and policy variants.

## Groups and permission sets

Human access is centrally managed from [IAM Identity Center](https://986542260596-qogog24k.eu-north-1.console.aws.amazon.com/singlesignon/home?region=eu-north-1#/instances/6508293e3330524d/dashboard) in the management account. Assign account access to groups rather than directly to individual users.

| Group            | Assignment                                       | Scope                                          |
| ---------------- | ------------------------------------------------ | ---------------------------------------------- |
| `Administrators` | `AdministratorAccess` in `rprlab` and `research` | Organization and infrastructure administration |
| `Researchers`    | `ResearcherAccess` in `research`                 | Normal research workloads                      |

`ResearcherAccess` is the lab-specific researcher permission set. It is built from the AWS-managed `PowerUserAccess` policy plus an inline policy that grants the additional, narrowly scoped IAM permissions documented below. Maintain both components on the `ResearcherAccess` permission set in IAM Identity Center.

Only trusted infrastructure administrators should join `Administrators`. Administrators normally also remain in `Researchers` so both intended account assignments are explicit.

See [Identity and access management](../administrators/identity-access.md) for adding users, MFA, privilege changes, and off-boarding.

## ResearcherAccess inline permissions

The AWS-managed `PowerUserAccess` policy does not allow researchers to pass IAM roles to EC2. `ResearcherAccess` therefore adds the following inline policy to the managed policy. It grants the minimum additional access required to view instance profiles and assign the approved `rprlab-ec2-research-instance-role` profile.

Edit this, and other policies from the `rprlab` management account under [IAM Identity Center > Multi-account permissions > Permission sets](https://986542260596-qogog24k.eu-north-1.console.aws.amazon.com/singlesignon/home?region=eu-north-1#/instances/6508293e3330524d/permission-sets).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowViewingEC2InstanceProfiles",
      "Effect": "Allow",
      "Action": [
        "iam:ListInstanceProfiles",
        "iam:GetInstanceProfile",
        "iam:GetRole"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AllowPassingApprovedEC2Role",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::376129434881:role/rprlab-ec2-research-instance-role",
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "ec2.amazonaws.com"
        }
      }
    }
  ]
}
```
