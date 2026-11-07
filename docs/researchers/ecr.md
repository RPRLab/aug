---
icon: lucide/container
tags:
  - ECR
  - Containers
---

# ECR

Amazon Elastic Container Registry (ECR) is the lab's shared store for container images. Use the `research` account (`376129434881`) in Stockholm (`eu-north-1`).

## Lab registry

Use one repository per tool under `rprlab/`, with a new version tag for each build:

```text
376129434881.dkr.ecr.eu-north-1.amazonaws.com/rprlab/<tool>:<version>
```

Researchers can create and manage repositories using their own [ResearcherAccess SSO session](accessing-aws.md).

## Creating a repository

1. Open [Amazon ECR](https://console.aws.amazon.com/ecr/home?region=eu-north-1) in the `research` account, choose **Private repositories**, then **Create repository**.

2. Name it `rprlab/<tool>`, using a short lowercase tool name. Choose **Immutable** image tags without exclusions and **AES-256** encryption, then choose **Create repository**.

3. Tag the repository with `Owner` set to your SSO username and `Project` set to your lowercase, hyphenated project code.

## Using images

1. Build the image and assign a new version tag.

2. [Push the image to ECR](https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html).

3. Record the image digest with the analysis results.

Keep the Dockerfile and build instructions in the project's source repository, and retain image versions needed to reproduce completed work.

Keep project inputs, outputs, and large reference databases in [S3](s3.md).

[SageMaker jobs](sagemaker.md) can pull images from all `rprlab/` repositories in this registry.

For ECR access from EC2, ask an [Administrator](../index.md#aws-administrators) to enable image pulls on the instance role.
