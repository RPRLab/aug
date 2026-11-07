---
icon: lucide/container
tags:
  - ECR
  - Containers
  - IAM
---

# Container registry (ECR)

Maintain one private lab registry in the `research` account (`376129434881`), in Stockholm (`eu-north-1`). Use one repository per tool, named `rprlab/<tool>`. The existing `rprlab/af3` repository follows this convention; create others as needed.

Researcher usage and image naming are documented under [Container images](../researchers/ecr.md).

## Creating a repository

1. Open [Amazon ECR](https://console.aws.amazon.com/ecr/home?region=eu-north-1) in the `research` account, choose **Private repositories**, then **Create repository**.

2. Name it `rprlab/<tool>`, using a short lowercase tool name. Choose **Immutable** image tags without exclusions and **AES-256** encryption, then choose **Create repository**.

3. Apply the [standard ownership tags](resource-standards.md#required-tags): `Owner=admin`, `Project=shared`, and `Version` as the creation date.

## Access and maintenance

Researchers push images using `ResearcherAccess`, whose `PowerUserAccess` policy already permits ECR operations.

The [SageMaker execution policy](../assets/policies/rprlab-sagemaker-training-execution.json) permits image pulls from every current and future repository matching `arn:aws:ecr:eu-north-1:376129434881:repository/rprlab/*`. New repositories under that prefix need no additional SageMaker permission change. The execution role has no ECR push or deletion permissions.

Other compute roles need separate ECR pull access. The shared EC2 instance role has not been granted this access; add only the permissions needed for its intended workloads.

Keep versions needed to reproduce research. Before applying image lifecycle rules, [preview which images they affect](https://docs.aws.amazon.com/AmazonECR/latest/userguide/LifecyclePolicies.html) and coordinate cleanup with the responsible researchers. Immutable tags prevent overwrites, not image deletion.
