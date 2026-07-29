---
icon: lucide/receipt
tags:
  - Billing
  - Cost Management
  - Budgets
---

# Billing and cost management

AWS Organizations consolidates charges from the `research` account into the `rprlab` management account. Owners and Administrators should therefore review organization-wide costs from `rprlab`, even though research workloads run only in `research`.

Use IAM Identity Center for routine billing administration. With respect to billing, root access is required only for the one-time activation described below.

## Enabling administrator access

By default, IAM users and roles cannot open the Billing and Cost Management console, even when their policies otherwise allow billing actions. An Owner must activate IAM access once for the `rprlab` management account.

1. Sign in to the `rprlab` management account as the root user.

2. Open the [Account page in the Billing and Cost Management console](https://console.aws.amazon.com/billing/home?#/account).

3. Under **IAM user and role access to Billing information**, choose **Edit**.

4. Select **Activate IAM access**, then choose **Update**.

5. Sign out of the root session.

6. Sign in through the [AWS access portal](https://ssoins-6508293e3330524d.portal.eu-north-1.app.aws) and open the `rprlab` account with `AdministratorAccess`.

7. Open [Billing and Cost Management](https://console.aws.amazon.com/costmanagement/) and confirm that the **Bills**, **Cost Explorer**, and **Budgets** pages are accessible.

Activating IAM access enables IAM identities to use the billing console; it does not grant billing permissions by itself. The existing `AdministratorAccess` assignment supplies those permissions for the `Administrators` group. If billing access is later delegated through a narrower permission set, grant only the required billing and cost-management actions.

## Reviewing costs

Use the following views for routine review:

| View                                                                               | Purpose                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [Bills](https://console.aws.amazon.com/billing/home#/bills)                        | Review month-to-date charges by account, service, and Region       |
| [Cost Explorer](https://console.aws.amazon.com/costmanagement/home#/cost-explorer) | Analyze trends, forecasts, and cost drivers                        |
| [Budgets](https://console.aws.amazon.com/costmanagement/home#/budgets)             | Monitor planned spending and alert thresholds                      |
| [Cost allocation tags](https://console.aws.amazon.com/billing/home#/tags)          | Activate resource tags so costs can be grouped by owner or project |

At least monthly, an Administrator should:

1. Compare current and forecast costs with the previous month.

2. Identify the accounts, services, and Regions responsible for material changes.

3. Investigate untagged spend and resources without the required `Owner` and `Project` tags.

4. Review stopped EC2 instances, unattached EBS volumes, retained snapshots, and obsolete AMIs for avoidable charges.

5. Confirm that budget notifications still reach an actively monitored lab address.

Follow [Resource standards](resource-standards.md) when assigning ownership or cleaning up resources. Coordinate any deletion with the responsible researcher or project owner before removing data or infrastructure.

## Cost allocation tags

The lab uses the `Owner` and `Project` tags defined under [Required tags](resource-standards.md#required-tags) to attribute resource costs.

After a tag key is first applied to a supported resource:

1. Open [Cost allocation tags](https://console.aws.amazon.com/billing/home#/tags) from the `rprlab` management account.

2. Under **User-defined cost allocation tags**, select `Owner` and `Project`.

3. Choose **Activate**.

Tag keys can take up to 24 hours to appear and another 24 hours to become active. If the tags were already assigned to resources, a management-account user can [backfill their activation status](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-allocation-backfill.html) for up to the previous 12 months. Backfill cannot recover values for periods when the resources did not yet carry those tags.
