---
icon: lucide/cpu
tags:
  - EC2
  - Compute
---

# Elastic Compute Cloud (EC2)

EC2 provides temporary virtual computers for running analyses.

## Understanding costs

EC2 is pay-as-you-go. For the lab's instances, compute is normally billed for each second that an instance is in the `running` state. A running instance costs the same whether it is busy, idle, or waiting at a shell prompt.

The selected instance type is usually the largest part of the cost. Instances with more CPU, memory, GPUs, or specialized hardware have higher rates. The total cost of an analysis also depends on how long the instance runs and on related resources such as [EBS storage](ebs.md).

| Instance state | Compute charges                                      | Other charges                                                                                          |
| -------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `running`      | Continue until the instance is stopped or terminated | EBS and any other attached resources are also billed                                                   |
| `stopped`      | Stop once the instance reaches the stopped state     | EBS volumes remain billable                                                                            |
| `terminated`   | Stop once termination begins                         | EBS volumes are deleted only when `DeleteOnTermination` is enabled; retained resources remain billable |

!!!Warning "An idle instance still costs money"

    Disconnecting from Session Manager, closing a laptop, or leaving an analysis idle does not stop the instance. Stop it only when you will resume soon. After copying important data to S3, terminate it when the work is complete.

### Estimating a job

Before launching an unusually large instance or a job expected to run for several days, make a rough estimate:

```text
estimated cost = instance hourly rate × running hours + prorated EBS storage
```

Check the current rate for the intended instance type and operating system on the [EC2 On-Demand pricing page](https://aws.amazon.com/ec2/pricing/on-demand/). Select the Stockholm Region (`eu-north-1`).

!!!Tip "Be smart about selecting resources"

    An instance that is twice as expensive per hour can still be cheaper overall if it completes a CPU-bound job in less than half the time.

### Keeping costs under control

- Choose the smallest approved launch template that can complete the job reliably. Running out of memory or disk and repeating the analysis can cost more than selecting an appropriate size initially.

- Copy only the data needed for the current analysis from S3.

- Monitor the job and terminate failed, completed, or abandoned instances promptly.

- Do not assume a stopped instance is free. Its EBS volumes remain and continue to incur storage charges.

- Apply accurate `Owner` and `Project` tags so usage can be attributed and unexpected resources can be investigated.

## Launching EC2 instances

### Launching an EC2 instance from an approved template

!!!Success "This is the recommended method for launching instances"

Most users should launch an EC2 instance from one of the provided launch templates: [EC2 > Instances > Launch Templates](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#LaunchTemplates:tag:Owner=admin;v=3;$case=tags:false%5C,client:false;$regex=tags:false%5C,client:false). These templates have been set up by administrators to ensure that reasonable resources are requested and created [EBS volumes](../researchers/ebs.md) are deleted on termination. They also set the necessary network settings and IAM profiles for connecting to the instance through SSM Session Manager rather than SSH.

Choose the smallest template that can reasonably run your job. [Upload final outputs to S3](../researchers/s3.md#uploading-files) and terminate the instance when finished.

With any instances you create, it is expected that you assign an `Owner` tag with your username, and a `Project` tag with a short code that will help identify the purpose of the instance. This way, if instances are left running or stopped, we can more easily triage what can safely be terminated.

You can launch templates from the [AWS Management Console](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#LaunchInstanceFromTemplate:) or the AWS CLI, for example:

```sh title="shell"
aws ec2 run-instances \
    --launch-template LaunchTemplateName=rprlab-hoodini-standard \
    --tag-specifications \
        "ResourceType=instance,Tags=[
            {Key=Owner,Value=leightonpayne},
            {Key=Project,Value=hoodini}
        ]"
```

If it launched successfully, the command will return some JSON. Look for the key `InstanceID` and take note of the value, e.g., `i-03e1eb484512d1b89`:

```json title="shell" hl_lines="8"
{
  "ReservationId": "r-04d942d3be0a42dab",
  "OwnerId": "376129434881",
  "Groups": [],
  "Instances": [
    {
      // Truncated
      "InstanceId": "i-03e1eb484512d1b89"
      // Truncated
    }
  ]
}
```

Use this value to connect to the instance:

```sh title="shell"
aws ssm start-session --target i-03e1eb484512d1b89
```

When you are done with the instance, make sure you terminate it:

```sh title="shell"
aws ec2 terminate-instances --instance-ids i-03e1eb484512d1b89
```

The command will return some JSON. Make sure the `CurrentState` is `shutting-down`:

```json title="shell" hl_lines="7"
{
  "TerminatingInstances": [
    {
      "InstanceId": "i-03e1eb484512d1b89",
      "CurrentState": {
        "Code": 32,
        "Name": "shutting-down"
      },
      "PreviousState": {
        "Code": 16,
        "Name": "running"
      }
    }
  ]
}
```

### Launching a custom EC2 instance with an approved AMI

!!!Warning "This method is not recommended unless you are experienced with AWS, familiar with [instance types](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#InstanceTypes:), [EBS volumes](../researchers/ebs.md) and understand the lab's [EC2 security setup](../administrators/ec2-security.md)"

If you need a nonstandard instance configuration, e.g., larger storage, more CPU, GPU, or memory, you can launch one of the lab AMIs with a custom instance: [EC2 > Images > AMIs](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#Images:). Users who bypass the launch template are responsible for confirming that temporary EBS volumes are deleted on termination and excessive resources are not requested or left running. Creating, modifying, and retiring AMIs is an [administrator responsibility](../administrators/amis.md).

If you find the resources provided by our approved launch templates are consistently not fit for your purposes, talk to an an [Owner](../index.md#aws-owners) or [Administrator](../index.md#aws-administrators) so we can configure a more appropriate template. It is preferred that we work together to establish reusable AMIs and launch templates to forecast costs and build an organized and maximally useful ecosystem for all users.

You can launch instances from AMIs from the [AWS Management Console](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#Images:) or the AWS CLI:

```sh title="shell"
aws ec2 run-instances \
    --image-id ami-0438575438cea9d9f \
    --instance-type t3.large \
    --iam-instance-profile Name=rprlab-ec2-research-instance-role \
    --security-group-ids sg-077c3d89ca8f32618
    --tag-specifications \
        "ResourceType=instance,Tags=[
            {Key=Owner,Value=leightonpayne},
            {Key=Project,Value=hoodini}
        ]"
```

Connect and terminate the instance as if [launching an EC2 instance from an approved template](#launching-an-ec2-instance-from-an-approved-template).

### Launching a custom EC2 instance from scratch

!!!Failure "This method is not recommended"

If you need a totally bespoke software and hardware setup, contact an [Owner](../index.md#aws-owners) or [Administrator](../index.md#aws-administrators). It is preferred that we work together to establish reusable AMIs and launch templates to forecast costs and build an organized and maximally useful ecosystem for all users.

<br>

[Learn about EBS volumes](../researchers/ebs.md){ .md-button .md-button--primary }

<br>
