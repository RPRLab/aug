---
icon: lucide/brain-circuit
tags:
  - SageMaker
  - Compute
---

# SageMaker AI

SageMaker runs containerized jobs on managed compute and shuts down that compute when the job ends. The lab uses **Managed Spot Training jobs** as an alternative to EC2 for suitable workloads. This workflow does not require Studio, notebooks, or a persistent endpoint.

## Lab configuration

Use the `research` account (`376129434881`) in Stockholm (`eu-north-1`).

| Setting | Value |
| --- | --- |
| Execution role | `arn:aws:iam::376129434881:role/rprlab-sagemaker-research-execution-role` |
| Private AF3 container repository | `376129434881.dkr.ecr.eu-north-1.amazonaws.com/rprlab/af3` |
| Project data and results | `s3://rprlab-research-376129434881-eu-north-1-an/projects/<project>/` |

Submit jobs and upload container images using your own [ResearcherAccess SSO session](accessing-aws.md). The execution role is for the job itself; the EC2 instance role does not have permission to submit jobs with it.

Set inputs, outputs, checkpoints, and any SDK source-code uploads to paths in the lab research bucket; the execution role cannot access an SDK-created `sagemaker-*` staging bucket.

## Running a job

1. Prepare and push a versioned [SageMaker-compatible container](https://docs.aws.amazon.com/sagemaker/latest/dg/your-algorithms-training-algo-dockerfile.html) to the repository. An EC2 AMI cannot be used directly. Keep project data and large reference databases in S3.

2. Check the **SageMaker training Spot quota** for the exact instance type in `eu-north-1`. EC2 quotas and SageMaker endpoint or processing quotas are separate; a quota does not guarantee available Spot capacity.

3. Create a training job through the CLI or SDK using the role above, `EnableManagedSpotTraining=true`, and finite `MaxRuntimeInSeconds` and `MaxWaitTimeInSeconds` limits. Set the wait limit higher than the runtime limit. Add `Owner` and `Project` tags and use a unique project output prefix.

4. Run a small pilot, check its results, CloudWatch logs, and actual cost before scaling. Handle interruptions so completed work is preserved. SageMaker Spot pricing differs from EC2 Spot pricing.

Follow the [S3 layout](s3.md#where-data-belongs) and [resource standards](../administrators/resource-standards.md). The job role can read and write throughout the research bucket, including overwriting existing files, but cannot delete objects or administer the bucket. Coordinate changes to shared data.

See AWS's [Managed Spot Training guide](https://docs.aws.amazon.com/sagemaker/latest/dg/model-managed-spot-training.html) and [input/output paths](https://docs.aws.amazon.com/sagemaker/latest/dg/model-train-storage-env-var-summary.html) when adapting a container. AF3 still needs a compatible container and a successful pilot; access alone does not verify the workload.

The repository uses immutable image tags: use a new version tag for each build. If you need another repository, a custom VPC, a customer-managed KMS key, or a different SageMaker workflow, contact an [Administrator](../index.md#aws-administrators). Shared infrastructure and permissions are maintained through the [administrator setup](../administrators/sagemaker.md).
