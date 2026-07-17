---
icon: lucide/layers-3
tags:
  - AMI
  - EC2
  - Compute
---

# Amazon Machine Images (AMIs)

An Amazon Machine Image (AMI) is a reusable template for launching [EC2 instances](../researchers/ec2.md). It captures an operating system, installed software, configuration, and the block-device mappings that define the instance's [EBS volumes](../researchers/ebs.md).

Owners and Administrators are responsible for creating, testing, approving, maintaining, and retiring the images used by the lab. Researchers should use approved launch templates and request a new or updated environment when those templates do not meet a project's needs.

AMIs should not be used as the primary place to preserve research data, analysis results, or files that should instead be stored in [S3](../researchers/s3.md).

See [Resource standards](resource-standards.md#ami-content) for the lab's default AMI content policy.

## AMIs and launch templates

An AMI defines the software environment: the operating system, installed tools, configuration, and initial disk contents. A launch template defines how an EC2 instance should be created from that image, including the AMI ID, default instance type, EBS volumes, security group, IAM instance profile, key-pair setting, and tags.

The two resources are maintained together. Researchers normally launch an approved template rather than configuring an AMI manually, because the template supplies the lab's standard security, access, storage, and cleanup settings. When an AMI is replaced, administrators create and test a new version of the existing launch template and then make that version the default.

## How AMIs work

The AMIs used by the lab are EBS-backed. When an AMI is created from an instance, AWS creates snapshots of its root EBS volume and, by default, the other attached EBS volumes included in the image configuration. The AMI records how those snapshots should be turned into volumes when a new instance is launched.

!!!Warning "The snapshots backing the AMI continue to occupy storage and incur charges until they are deleted"

| Resource     | Purpose                                                    | Lifecycle                                                          |
| ------------ | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| AMI          | Defines a reusable machine configuration                   | Remains available until deprecated, disabled, or deregistered      |
| EBS snapshot | Stores the blocks that back an EBS-backed AMI              | Remains billable until it is deleted                               |
| EC2 instance | A running or stopped virtual computer launched from an AMI | Independent of the source AMI after launch                         |
| EBS volume   | A live disk attached to an instance                        | Deleted or retained according to its `DeleteOnTermination` setting |

## Creating an AMI and launch template from an EC2 instance

### Preparing the instance

The quality and size of an AMI depend on the state of its source instance.

To launch an EC2 instance, in the `research` account, navigate to [EC2 > Instances > Launch instances](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#Instances:)

Under **Name and tags**, give the instance a temporary name (e.g., `ami-build`).

Under **Application and OS Images**, select an appropriate operating system. The recommended for most research software setups is whatever is the latest Ubuntu build. Check that the selected architecture is `x86_64`, unless `arm64` is explicitly required.

Under **Instance type**, select a provision large enough to complete installation and testing. The build instance type does not determine the size of instances later launched from the image, but the architecture must remain compatible.

Under **Key pair**, select **Proceed without a key pair**.

Under **Network settings** section **Firewall (security groups)**, toggle **Select existing security group** and select `rprlab-session-manager-only`.

Under **Configure storage**, set a root volume size that is only large enough for the operating system and required software. Future launch templates can increase it or attach additional volumes, but a snapshot-backed volume cannot be made smaller than its source.

Under **Advanced details** section **IAM instance profile**, select `rprlab-ec2-research-instance-role`.

Click **Launch instance** and **Connect to instance** under **SSM Session Manager**

Install relevant software for the planned purpose of the image. Make sure to Remove temporary files, package caches, downloads, logs, and scratch data that should not appear on every future instance.

Check disk use with `df -h` and confirm that the root volume is sensibly sized.

### Creating the AMI

Once the instance is prepared, select it under [EC2 > Instances](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#Instances:), choose **Instance state > Stop instance**, then choose **Actions > Image and templates > Create image**.

Under **Image details**, give the AMI a stable name containing the platform, application and a version, for example:

```text
rprlab-ubuntu26-hoodini-v1
```

Also apply the following tags to shared AMIs and their snapshots:

- `Owner` as `admin`

- `Project` as `shared`

- `Version` as the date in [ISO format](https://www.iso.org/iso-8601-date-and-time-format.html).

Depending on the size of the final volume, it may take minutes to hours to complete the snapshot. You can check the progress by navigating to the AMI details, clicking **Storage** and the snapshot Device ID (i.e., `snap-xxxxxxxxxxxxxxxxx`).

When the AMI is ready, launch a new test instance from it and verify:

- The instance boots successfully

- SSM Session Manager can connect

- Expected software starts and runs as expected

Terminate the test and source instances when they are no longer needed.

### Creating the launch template

After the AMI has passed testing, create or update a launch template under [EC2 > Instances > Launch Templates](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#LaunchTemplates:).

For a new supported template, choose **Create launch template**.

Under **Launch template name and description**, give the template a stable name, for example:

```
 `rprlab-hoodini-standard`
```

Also describe the image series, default instance resources, storage, and purpose. For example:

```
RPR Lab launch template to initiate a c7i.2xlarge (8 vCPU, 16 GiB) instance with a 250 GB root volume, using the latest rprlab-ubuntu26-hoodini series of AMI
```

Under **Application and OS Images**, choose **My AMIs > Owned by me** and select the tested image.

Choose an appropriate default instance type. General-purpose (m) and compute-optimized (c) Intel (i) families are suitable baselines for many x86_64 workloads, for example `m7i` or `c7i`, but select based on expected CPU, memory, architecture, and cost requirements.

Under **Network settings** section **Firewall (security groups)**, toggle **Select existing security group** and select `rprlab-session-manager-only`.

Under **Configure storage**, select an appropriate size for the root volume. This can be scalled up if the template is intended for large data workloads. Confirm **Delete on termination** is selected.

Under **Advanced details** section **IAM instance profile**, select `rprlab-ec2-research-instance-role`.

Under **Resource tags**, apply `LaunchTemplate` as the name of the launch template.

Click **Create launch template**.

Once the template is prepared, select it under [EC2 > Instances > Launch Templates](https://376129434881-cvwoy6d4.eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#LaunchTemplates:), choose **Actions > Launch instance from template**.

Verify it is working as expected, then terminate the instance.

Consider building additional `small` or `large` templates the up- or down-scale resources to provide options for users based on their needs, e.g. `rprlab-hoodini-large`.

## Updating a launch template

Launch templates can be re-versioned by selecting an existing launch template and choosing **Actions > Modify template (Create new version)**.

When updating, remember to set the new version as the default.

## Deregistering an AMI

Deregister an AMI only when you have coordinated its removal with the responsible project or administrator.

Before deregistering:

1. Confirm that no launch template, automation, or documented workflow references its image ID.

2. Confirm that a tested replacement exists when the image is still part of an active workflow.

3. Identify the snapshots associated with the AMI and decide whether they are used by another image or needed for recovery.

!!!Failure "Deregistration is destructive"

    Deregistering prevents new instances from being launched from the AMI. Deleting its snapshots removes the stored image data. Existing instances launched from the AMI are not deleted, but they do not make the AMI recoverable.

In the console, select the obsolete image, choose **Actions > Deregister AMI**, and select **Delete associated snapshots** only after completing the checks above.
