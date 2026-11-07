---
icon: lucide/brain-circuit
tags:
  - SageMaker
  - Compute
---

# SageMaker

SageMaker runs containerized jobs on managed compute and shuts down that compute when the job ends. The lab uses **Managed Spot Training jobs**, which can also run predictions with an existing model.

## Lab configuration

Use the `research` account (`376129434881`) in Stockholm (`eu-north-1`).

| Setting | Value |
| --- | --- |
| Execution role | `arn:aws:iam::376129434881:role/rprlab-sagemaker-research-execution-role` |
| Container image | `376129434881.dkr.ecr.eu-north-1.amazonaws.com/rprlab/<tool>:<version>` |
| Project data and results | `s3://rprlab-research-376129434881-eu-north-1-an/projects/<project>/` |

Submit jobs using your own [ResearcherAccess SSO session](accessing-aws.md) and select the execution role above for the job.

Set inputs, outputs, checkpoints, and SDK source-code uploads explicitly to the lab bucket, following the [S3 layout](s3.md#where-data-belongs). Override the SDK's default staging bucket.

## Running a job

1. Build a [SageMaker-compatible container](https://docs.aws.amazon.com/sagemaker/latest/dg/your-algorithms-training-algo-dockerfile.html) and push a versioned image to your tool's [ECR repository](ecr.md).

2. Check the **SageMaker training Spot quota** for the exact instance type in `eu-north-1`.

3. Submit a small pilot job through the CLI or SDK, using the execution role above and the settings below.

4. Check the results, CloudWatch logs, and actual cost before scaling. Save completed work to S3 so it survives Spot interruptions.

| Job setting | Required value |
| --- | --- |
| `EnableManagedSpotTraining` | `true` |
| `MaxRuntimeInSeconds` | A finite runtime limit |
| `MaxWaitTimeInSeconds` | A finite wait limit higher than the runtime limit |
| Tags | `Owner` and `Project`, following the [resource standards](../administrators/resource-standards.md#required-tags) |
| Output location | A unique prefix within the project's S3 location |

Use SageMaker training Spot quotas and prices; these are separate from EC2.

!!!Warning "Shared bucket access"

    Jobs can overwrite files throughout the research bucket. Coordinate changes to shared data and follow the [worker access guidance](s3.md#access-from-ec2).

See AWS's [Managed Spot Training guide](https://docs.aws.amazon.com/sagemaker/latest/dg/model-managed-spot-training.html) and [input/output paths](https://docs.aws.amazon.com/sagemaker/latest/dg/model-train-storage-env-var-summary.html) when adapting a container.

Administrators maintain the [execution role and access](../administrators/sagemaker.md).
