---
icon: lucide/container
tags:
  - ECR
  - Containers
  - IAM
---

# Container registry (ECR)

Maintain one private lab registry in the `research` account (`376129434881`), in Stockholm (`eu-north-1`). Use one repository per tool, named `rprlab/<tool>`.

Researchers create and manage repositories following [ECR](../researchers/ecr.md#creating-a-repository). Reserve `Owner=admin` and `Project=shared` for shared administrator-managed repositories, following the [standard ownership tags](resource-standards.md#required-tags).

## Access and maintenance

`ResearcherAccess` already includes `PowerUserAccess`, which permits repository creation and image management.

The [SageMaker execution policy](../assets/policies/rprlab-sagemaker-training-execution.json) grants read-only image pulls from `arn:aws:ecr:eu-north-1:376129434881:repository/rprlab/*`, including newly created repositories.

The shared EC2 instance role needs ECR pull permissions added before it can use these images.

Keep versions needed to reproduce research. Before applying image lifecycle rules, [preview which images they affect](https://docs.aws.amazon.com/AmazonECR/latest/userguide/LifecyclePolicies.html) and coordinate cleanup with the responsible researchers.
