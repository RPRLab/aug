---
icon: lucide/shield-check
tags:
  - SageMaker
  - IAM
  - ECR
  - Security
---

# SageMaker access

Administrators maintain the execution role used by the lab's SageMaker training jobs. Researchers submit jobs through their own `ResearcherAccess` session; the execution role supplies permissions to the running job.

The resources below already exist. These console instructions describe how to maintain or recreate them. CloudShell is not required. Research usage is documented under [SageMaker AI](../researchers/sagemaker.md).

## Standard resources

Maintain these resources in the `research` account (`376129434881`), using Stockholm (`eu-north-1`) for regional resources.

| Resource | Name | Purpose |
| --- | --- | --- |
| IAM execution role | `rprlab-sagemaker-research-execution-role` | Used only by SageMaker training jobs in this account and Region |
| Customer managed policy | `rprlab-sagemaker-training-execution` | Pulls images from `rprlab/*` repositories and writes training logs and metrics |
| Customer managed policy | `rprlab-ec2-research-s3-read-write` | Supplies read/write access throughout the research bucket |

The execution role can overwrite objects anywhere in the research bucket, but cannot delete objects or administer the bucket. Use it only for workloads trusted with the whole bucket. The current setup supports training jobs without a custom VPC or customer-managed KMS key.

Container repositories and image retention follow the [ECR setup](ecr.md). The execution role can pull from all current and future `rprlab/` repositories in this account and Region, but cannot push or delete images.

## Creating the execution role

1. Open [IAM > Policies](https://console.aws.amazon.com/iam/home#/policies) in the `research` account, choose **Create policy**, select **JSON**, and paste the [training execution policy](../assets/policies/rprlab-sagemaker-training-execution.json). Name it `rprlab-sagemaker-training-execution` and apply the standard ownership tags.

2. Open [IAM > Roles](https://console.aws.amazon.com/iam/home#/roles), choose **Create role**, then **Custom trust policy**. Paste the [training role trust policy](../assets/policies/rprlab-sagemaker-research-trust.json). This restricts the role to SageMaker training jobs in the research account and Stockholm.

3. Attach `rprlab-sagemaker-training-execution` and the existing `rprlab-ec2-research-s3-read-write` policy. If the S3 policy is missing, recreate it from the [S3 policy JSON](../assets/policies/rprlab-ec2-research-s3-read-write.json).

4. Name the role `rprlab-sagemaker-research-execution-role`, describe its purpose, apply the standard ownership tags, and choose **Create role**.

For an existing role, review its **Permissions** and **Trust relationships** tabs against the linked policies before changing it. Keep the EC2 instance role separate.

## Giving researchers access

From the `rprlab` management account, follow the [ResearcherAccess inline-policy instructions](org-structure.md#researcheraccess-inline-permissions) to allow researchers to pass this role to SageMaker, then update the permission set in the research account. Edit the permission set in IAM Identity Center, not the generated `AWSReservedSSO_ResearcherAccess_...` IAM role.

This applies to everyone assigned `ResearcherAccess`, including the `Researchers` group. `PowerUserAccess` already permits SageMaker and ECR operations; this setup adds only the approved role delegation. It does not restrict researchers to Spot training.

After a change, verify the role's policies and permission-set provisioning status. A successful workload pilot is still required before scaling; permission checks alone do not verify the container.
