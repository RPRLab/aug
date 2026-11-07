---
icon: lucide/shield-check
tags:
  - SageMaker
  - IAM
  - ECR
  - Security
---

# SageMaker access

Administrators maintain the execution role used by the lab's SageMaker training jobs. The resources below already exist; use these console instructions to maintain or recreate them. Researchers follow the [SageMaker guide](../researchers/sagemaker.md).

## Standard resources

Maintain these resources in the `research` account (`376129434881`), using Stockholm (`eu-north-1`) for regional resources.

| Resource | Name | Purpose |
| --- | --- | --- |
| IAM execution role | `rprlab-sagemaker-research-execution-role` | Used only by SageMaker training jobs in this account and Region |
| Customer managed policy | `rprlab-sagemaker-training-execution` | Pulls images from `rprlab/*` repositories and writes training logs and metrics |
| Customer managed policy | `rprlab-ec2-research-s3-read-write` | Supplies read/write access throughout the research bucket |

The execution role has whole-bucket read/write access, including overwrites, without S3 deletion or bucket administration. Its ECR access permits image pulls only. Repository permissions and retention are covered under [ECR](ecr.md).

## Creating the execution role

1. Open [IAM > Policies](https://console.aws.amazon.com/iam/home#/policies) in the `research` account, choose **Create policy**, select **JSON**, and paste the [training execution policy](../assets/policies/rprlab-sagemaker-training-execution.json). Name it `rprlab-sagemaker-training-execution` and apply the standard ownership tags.

2. Open [IAM > Roles](https://console.aws.amazon.com/iam/home#/roles), choose **Create role**, then **Custom trust policy**. Paste the [training role trust policy](../assets/policies/rprlab-sagemaker-research-trust.json).

3. Attach `rprlab-sagemaker-training-execution` and the existing `rprlab-ec2-research-s3-read-write` policy. If the S3 policy is missing, recreate it from the [S3 policy JSON](../assets/policies/rprlab-ec2-research-s3-read-write.json).

4. Name the role `rprlab-sagemaker-research-execution-role`, describe its purpose, apply the standard ownership tags, and choose **Create role**.

For an existing role, compare its **Permissions** and **Trust relationships** tabs with the linked policies. Review additional permissions when introducing a custom VPC or customer-managed KMS key.

## Giving researchers access

In the `rprlab` management account, use IAM Identity Center to update the permission set following the [ResearcherAccess inline-policy instructions](org-structure.md#researcheraccess-inline-permissions). This allows researchers to pass the execution role to SageMaker. Apply the updated permission set to the research account.

`PowerUserAccess` already permits SageMaker and ECR operations, including On-Demand jobs. The inline policy adds permission to pass the approved role for everyone assigned `ResearcherAccess`.

After a change, verify the role's policies and permission-set provisioning status.
