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

## Groups and permission sets

Human access is centrally managed from [IAM Identity Center](https://986542260596-qogog24k.eu-north-1.console.aws.amazon.com/singlesignon/home?region=eu-north-1#/instances/6508293e3330524d/dashboard) in the management account. Assign account access to groups rather than directly to individual users.

| Group         | Assignment                                       | Scope                                          |
| ------------- | ------------------------------------------------ | ---------------------------------------------- |
| `Lab-Admins`  | `AdministratorAccess` in `rprlab` and `research` | Organization and infrastructure administration |
| `Researchers` | `PowerUserAccess` in `research`                  | Normal research workloads                      |

Only trusted infrastructure administrators should join `Lab-Admins`. Administrators normally also remain in `Researchers` so both intended account assignments are explicit.

See [Identity and access management](../administrators/identity-access.md) for adding users, MFA, privilege changes, and off-boarding.

## Researcher instance-profile permissions

The `PowerUserAccess` permission set does not ordinarily allow researchers to pass IAM roles to EC2. The following inline policy was added to grant the minimum additional access required to view and assign the approved `rprlab-ec2-research-instance-role` profile.

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
