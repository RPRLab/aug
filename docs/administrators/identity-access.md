---
icon: lucide/users-round
tags:
  - IAM
  - Identity Center
  - Access
---

# Identity and access management

Human access to the lab's AWS organization is managed through IAM Identity Center. Do not create long-lived IAM users for normal access.

All IAM Identity Center administration is performed from the `rprlab` management account using an authorized `Lab-Admins` identity.

## Adding a user

1. Sign in through the AWS access portal and open the `rprlab` management account with `AdministratorAccess`.

2. Navigate to **IAM Identity Center > Users** and choose **Add user**.

3. Set the username to the person's concatenated first and last name in lowercase, for example `leightonpayne`. IAM Identity Center usernames are unique and cannot be changed later.

4. Enter the person's name and email address. Use a personal address if continued access after departure is expected.

5. Keep the option to email password setup instructions selected. IAM Identity Center invitations expire, so resend the invitation if it is not accepted in time.

6. Add the user to `Researchers` only. Add them to `Lab-Admins` as well only when administrator access has been explicitly approved.

7. Review the details and choose **Add user**.

8. Ask the user to accept the invitation, create their password, register MFA, and confirm that the expected accounts and permission sets appear in the AWS access portal.

## MFA requirements

The lab requires MFA for IAM Identity Center sign-in. New users should be required to register a device during their first sign-in, and the current policy requires MFA at every sign-in.

Administrators should periodically confirm this under **IAM Identity Center > Settings > Authentication > Multi-factor authentication**.

If a user loses an MFA device, verify their identity through an independent channel before removing or replacing it. Do not disable MFA enforcement to work around an individual enrollment problem.

## Changing access

Change access through group membership:

- To grant researcher access, add the user to `Researchers`.

- To grant administrator access, retain `Researchers` and additionally add `Lab-Admins`.

- To remove administrator access while retaining research access, remove only `Lab-Admins`.

- To suspend all access without immediately deleting the identity, disable user access or remove all account assignments while the situation is reviewed.

After any privilege change, verify the user's group memberships and account assignments from IAM Identity Center. Record who approved administrator access and when it was granted or removed.

## Off-boarding

Off-board access as soon as it is no longer required.

1. Delete the IAM Identity Center user if they are being fully off-boarded.

2. Review resources tagged with the user's `Owner` value, including running and stopped EC2 instances, EBS volumes, S3 objects under their user prefix.

3. Transfer project data that must be retained, then remove abandoned compute and storage in coordination with the project owner.

4. If the person had access to any non-Identity Center recovery credential, shared secret, root mailbox, root password, or root MFA device, rotate that credential using the root-access procedure below.

## Privilege levels and recovery access

Treat access according to the authority it confers:

| Access                  | Authority                                                                      | Off-boarding action                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Management account root | Unrestricted control of the organization and billing                           | Rotate the password for the recovery mailbox (or the recovery mailbox itself) first, then the root password and MFA |
| Research account root   | Unrestricted control of research resources                                     | Rotate the password for the recovery mailbox (or the recovery mailbox itself) first, then the root password and MFA |
| Root recovery mailbox   | Can initiate account recovery                                                  | Rotate the password for the mailbox and make sure the user is not listed in the recovery methods                    |
| `Lab-Admins`            | Can manage Identity Center, accounts, permissions, and research infrastructure | Remove from `Lab-Admins` group; delete the user if fully off-boarded                                                |
| `Researchers`           | Can create and manage most resources in the research account                   | Remove from `Researchers` group; delete the user if fully off-boarded                                               |

!!!Failure "Root credentials are break-glass credentials"

    Never use root credentials for routine administration. Store recovery information in an independently secured system with tightly limited access.

When root credential rotation is required:

1. Ensure at least two Owners are involved and record why access is required.

2. Secure the root recovery mailbox first, including its password, MFA, recovery methods, and active sessions.

3. Sign in through the AWS root-user flow and rotate the root password.

4. Replace the root MFA device and remove the previous device.
