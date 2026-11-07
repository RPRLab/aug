---
icon: lucide/info
---

# Introduction

To get access to the lab AWS environment, contact one of the [Owners](../index.md#aws-owners) or [Administrators](../index.md#aws-administrators).

## In brief

Amazon Web Services (AWS) provides on-demand compute and storage. The lab's shared AWS environment supports running analyses, storing data, and sharing computational resources.

[EC2](ec2.md) provides temporary virtual computers for running analyses. [EBS](ebs.md) provides their attached working storage, while [S3](s3.md) provides long-term shared storage for data and results.

[SageMaker](sagemaker.md) provides managed Spot jobs for suitable containerized workloads. [ECR](ecr.md) stores the container images used by those jobs. Researchers can create repositories for their tools and run jobs using the lab's approved execution role.

Explore these guides to choose the services and workflow suited to your analysis.

<br>

[Learn how to access AWS](accessing-aws.md){ .md-button .md-button--primary }

<br>
