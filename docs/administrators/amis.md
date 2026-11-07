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

!!!Warning "AMI snapshots remain billable"

    Snapshots continue to occupy storage and incur charges until they are deleted.

| Resource     | Purpose                                                    | Lifecycle                                                          |
| ------------ | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| AMI          | Defines a reusable machine configuration                   | Remains available until deprecated, disabled, or deregistered      |
| EBS snapshot | Stores the blocks that back an EBS-backed AMI              | Remains billable until it is deleted                               |
| EC2 instance | A running or stopped virtual computer launched from an AMI | Independent of the source AMI after launch                         |
| EBS volume   | A live disk attached to an instance                        | Deleted or retained according to its `DeleteOnTermination` setting |

## Creating an AMI and launch template from an EC2 instance

### Preparing the instance

The quality and size of an AMI depend on the state of its source instance.

1. In the `research` account, open [EC2 > Instances](https://console.aws.amazon.com/ec2/home?region=eu-north-1#Instances:) and choose **Launch instances**.

2. Under **Name and tags**, give the instance a temporary name, such as `ami-build`, and apply the [standard ownership tags](resource-standards.md#required-tags).

3. Under **Application and OS Images**, select an operating system compatible with the required software. Ubuntu is the usual starting point. Choose `x86_64` unless `arm64` is explicitly required.

4. Under **Instance type**, choose enough resources for installation and testing. The build instance type does not determine the size of instances later launched from the image, but the architecture must remain compatible.

5. Under **Key pair**, select **Proceed without a key pair**.

6. Under **Network settings > Firewall (security groups)**, choose **Select existing security group** and select `rprlab-session-manager-only`.

7. Under **Configure storage**, size the root volume for the operating system and required software. Confirm **Delete on termination** is selected for temporary volumes. A launch template can increase the volume size later, but cannot make a snapshot-backed volume smaller than its source.

8. Under **Advanced details > IAM instance profile**, select `rprlab-ec2-research-instance-role`.

9. Choose **Launch instance**, then connect through **Connect > Session Manager > Connect**.

10. Install and test the required software. Remove temporary files, package caches, downloads, logs, and scratch data, then check disk use with `df -h`.

### Creating the AMI

1. Select the prepared instance under [EC2 > Instances](https://console.aws.amazon.com/ec2/home?region=eu-north-1#Instances:), choose **Instance state > Stop instance**, then **Actions > Image and templates > Create image**.

2. Under **Image details**, give the AMI a name containing the platform, application, and version, such as `rprlab-ubuntu26-hoodini-v1`.

3. Tag shared AMIs and their snapshots with `Owner=admin`, `Project=shared`, and `Version` set to the creation date in [ISO format](https://www.iso.org/iso-8601-date-and-time-format.html).

4. Create the image and wait for it to become available. To check snapshot progress, open the AMI under [EC2 > Images > AMIs](https://console.aws.amazon.com/ec2/home?region=eu-north-1#Images:), choose **Storage**, and select its snapshot ID.

5. Launch a test instance from the AMI. Confirm that it boots, Session Manager connects, and the required software runs correctly.

6. Terminate the test and source instances when they are no longer needed.

Snapshot creation can take minutes to hours, depending on the volume size.

### Creating the launch template

After testing the AMI, create a template for a new environment or [update the existing template](#updating-a-launch-template).

1. Open [EC2 > Instances > Launch Templates](https://console.aws.amazon.com/ec2/home?region=eu-north-1#LaunchTemplates:) and choose **Create launch template**.

2. Under **Launch template name and description**, use a stable name such as `rprlab-hoodini-standard`. Describe the image series, default compute and storage, and intended use.

3. Under **Application and OS Images**, choose **My AMIs > Owned by me** and select the tested image.

4. Choose a default instance type suited to the workload's CPU, memory, architecture, and cost requirements. General-purpose `m7i` or compute-optimized `c7i` instances are possible baselines for x86_64 workloads.

5. Leave the **Key pair** unspecified. Under **Network settings > Firewall (security groups)**, choose **Select existing security group** and select `rprlab-session-manager-only`.

6. Under **Configure storage**, set the required volume sizes and confirm **Delete on termination** is selected for temporary volumes.

7. Under **Advanced details > IAM instance profile**, select `rprlab-ec2-research-instance-role`.

8. Under **Resource tags**, set `LaunchTemplate` to the template name. Researchers must apply their own `Owner` and `Project` tags when launching instances.

9. Choose **Create launch template**, then select it and choose **Actions > Launch instance from template**.

10. Verify the instance works as expected, then terminate it.

Provide additional size options when needed, such as `rprlab-hoodini-large`.

## Updating a launch template

1. Open [EC2 > Instances > Launch Templates](https://console.aws.amazon.com/ec2/home?region=eu-north-1#LaunchTemplates:), select the template, and choose **Actions > Modify template (Create new version)**.

2. Update the configuration, save the new version, and launch a test instance from that version.

3. After testing, set the new version as the default and terminate the test instance.

## Deregistering an AMI

Deregister an AMI only when you have coordinated its removal with the responsible project or administrator.

Before deregistering:

1. Confirm that no launch template, automation, or documented workflow references its image ID.

2. Confirm that a tested replacement exists when the image is still part of an active workflow.

3. Identify the snapshots associated with the AMI and decide whether they are used by another image or needed for recovery.

!!!Failure "Deregistration is destructive"

    Deregistering prevents new instances from being launched from the AMI. Deleting its snapshots removes the stored image data. Existing instances launched from the AMI are not deleted, but they do not make the AMI recoverable.

Under [EC2 > Images > AMIs](https://console.aws.amazon.com/ec2/home?region=eu-north-1#Images:), select the obsolete image, choose **Actions > Deregister AMI**, and select **Delete associated snapshots** only after completing the checks above.
