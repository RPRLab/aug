---
icon: lucide/hard-drive
tags:
  - EBS
  - Compute
  - Storage
---

# Elastic Block Store (EBS)

EBS provides the attached disk storage used by EC2 instances while they are running.

## How EBS relates to EC2 instances

An EBS volume is a virtual disk. Most EC2 instances have an EBS root volume containing the operating system and installed software. An instance can also have additional EBS volumes attached for larger working datasets.

Treat EBS as working storage for an analysis rather than long-term storage: copy important inputs and outputs to [S3](../researchers/s3.md), then terminate the instance and remove any storage that is no longer needed.

The lab's approved [EC2 launch templates](../researchers/ec2.md#launching-an-ec2-instance-from-an-approved-template) create the required volumes when an instance is launched and configure them to be deleted when that instance is terminated. If you launch an instance without an approved template, change its storage configuration, or attach another volume, you are responsible for checking its deletion behavior.

| Action                | What happens to EBS storage                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Launch an instance    | The root volume and any configured data volumes are created and attached to the instance.                                                                       |
| Stop an instance      | Its EBS volumes and data remain. You stop paying for instance compute, but continue paying for the EBS volumes.                                                 |
| Terminate an instance | Each volume is deleted only when its `DeleteOnTermination` setting is `true`. Any preserved volume remains in the account and continues to incur storage costs. |
| Detach a volume       | Its data remains, but the volume becomes unattached and continues to incur storage costs.                                                                       |
| Delete a volume       | The volume and its data are permanently deleted.                                                                                                                |

!!!Warning "Stopping is not the same as terminating"

    A stopped instance retains its EBS volumes and continues to incur EBS charges. Stop an instance when you intend to resume it soon; terminate it when the work is complete.

## Checking deletion behavior

If you have deviated from an approved launch template, before terminating a custom instance, check its storage under [EC2 > Instances](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#Instances:) or with the AWS CLI:

```sh title="shell"
aws ec2 describe-instances \
    --instance-ids i-03e1eb484512d1b89 \
    --query \
        'Reservations[].Instances[].BlockDeviceMappings[].{
            Device:DeviceName,
            Volume:Ebs.VolumeId,
            DeleteOnTermination:Ebs.DeleteOnTermination
        }'
```

The expected value for temporary root and working volumes is `true`:

```json title="shell" hl_lines="5"
[
  {
    "Device": "/dev/sda1",
    "Volume": "vol-0123456789abcdef0",
    "DeleteOnTermination": true
  }
]
```

!!!Failure "Deleting an EBS volume is permanent"

    Confirm that anything important has been copied to S3 before terminating an instance or deleting a volume. Do not change or delete a resource owned by another user or project.

<br>

[Learn about S3 storage](../researchers/s3.md){ .md-button .md-button--primary }

<br>
