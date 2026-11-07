---
icon: lucide/container
tags:
  - ECR
  - Containers
---

# Container images (ECR)

Amazon Elastic Container Registry (ECR) is the lab's shared store for container images. Use the `research` account (`376129434881`) in Stockholm (`eu-north-1`).

## Lab registry

The registry is `376129434881.dkr.ecr.eu-north-1.amazonaws.com`. Each tool has its own repository under `rprlab/`, and each build has its own version tag:

```text
376129434881.dkr.ecr.eu-north-1.amazonaws.com/rprlab/<tool>:<version>
```

The AF3 repository, `rprlab/af3`, already exists. Ask an [Administrator](../index.md#aws-administrators) to create a repository when a new tool needs one.

## Using images

1. Build and [push the image](https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html) using your own [ResearcherAccess SSO session](accessing-aws.md).

2. Use a new version tag for each build. Tags are immutable, so an existing tag cannot be overwritten. Keep the Dockerfile and build instructions in the project's source repository, and record the image digest with analysis results.

3. Keep project inputs, outputs, and large reference databases in [S3](s3.md). Retain image versions needed to reproduce completed work.

[SageMaker jobs](sagemaker.md) can pull images from all current and future `rprlab/` repositories in this registry. Images still need to be compatible with the service running them; storing an image in ECR does not make it SageMaker-compatible.

Other compute roles need their own ECR pull permissions. The shared EC2 instance role currently does not have them; contact an Administrator before using private ECR images from EC2.
