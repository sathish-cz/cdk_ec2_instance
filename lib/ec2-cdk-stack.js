"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ec2CdkStack = void 0;
const ec2 = require("aws-cdk-lib/aws-ec2");
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const path = require("path");
// import { KeyPair } from 'cdk-ec2-key-pair';
const aws_s3_assets_1 = require("aws-cdk-lib/aws-s3-assets");
class Ec2CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create a Key Pair to be used with this EC2 Instance
        // Temporarily disabled since `cdk-ec2-key-pair` is not yet CDK v2 compatible
        // const key = new KeyPair(this, 'KeyPair', {
        //   name: 'cdk-keypair',
        //   description: 'Key Pair created with CDK Deployment',
        // });
        // key.grantReadOnPublicKey
        // Create new VPC with 2 Subnets
        const vpc = new ec2.Vpc(this, 'VPC', {
            natGateways: 0,
            subnetConfiguration: [{
                    cidrMask: 24,
                    name: "asterisk",
                    subnetType: ec2.SubnetType.PUBLIC
                }]
        });
        // Allow SSH (TCP Port 22) access from anywhere
        const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc,
            description: 'Allow SSH (TCP port 22) in',
            allowAllOutbound: true
        });
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH Access');
        const role = new iam.Role(this, 'ec2Role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
        });
        role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
        // Use Latest Amazon Linux Image - CPU Type ARM64
        const ami = new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            cpuType: ec2.AmazonLinuxCpuType.ARM_64
        });
        // Create the instance using the Security Group, AMI, and KeyPair defined in the VPC created
        const ec2Instance = new ec2.Instance(this, 'Instance', {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
            machineImage: ami,
            securityGroup: securityGroup,
            // keyName: key.keyPairName,
            role: role
        });
        // Create an asset that will be used as part of User Data to run on first load
        const asset = new aws_s3_assets_1.Asset(this, 'Asset', { path: path.join(__dirname, '../src/config.sh') });
        const localPath = ec2Instance.userData.addS3DownloadCommand({
            bucket: asset.bucket,
            bucketKey: asset.s3ObjectKey,
        });
        ec2Instance.userData.addExecuteFileCommand({
            filePath: localPath,
            arguments: '--verbose -y'
        });
        asset.grantRead(ec2Instance.role);
        // Create outputs for connecting
        new cdk.CfnOutput(this, 'IP Address', { value: ec2Instance.instancePublicIp });
        // new cdk.CfnOutput(this, 'Key Name', { value: key.keyPairName })
        new cdk.CfnOutput(this, 'Download Key Command', { value: 'aws secretsmanager get-secret-value --secret-id ec2-ssh-key/cdk-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem' });
        new cdk.CfnOutput(this, 'ssh command', { value: 'ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@' + ec2Instance.instancePublicIp });
    }
}
exports.Ec2CdkStack = Ec2CdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWMyLWNkay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVjMi1jZGstc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTJDO0FBQzNDLG1DQUFtQztBQUNuQywyQ0FBMEM7QUFDMUMsNkJBQTZCO0FBQzdCLDhDQUE4QztBQUM5Qyw2REFBa0Q7QUFHbEQsTUFBYSxXQUFZLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDeEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixzREFBc0Q7UUFDdEQsNkVBQTZFO1FBQzdFLDZDQUE2QztRQUM3Qyx5QkFBeUI7UUFDekIseURBQXlEO1FBQ3pELE1BQU07UUFDTiwyQkFBMkI7UUFFM0IsZ0NBQWdDO1FBQ2hDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ25DLFdBQVcsRUFBRSxDQUFDO1lBQ2QsbUJBQW1CLEVBQUUsQ0FBQztvQkFDcEIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU07aUJBQ2xDLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCwrQ0FBK0M7UUFDL0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDakUsR0FBRztZQUNILFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFDSCxhQUFhLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQTtRQUV0RixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUN6QyxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUM7U0FDekQsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFBO1FBRWpHLGlEQUFpRDtRQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztZQUNuQyxVQUFVLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLGNBQWM7WUFDcEQsT0FBTyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNO1NBQ3ZDLENBQUMsQ0FBQztRQUVILDRGQUE0RjtRQUM1RixNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNyRCxHQUFHO1lBQ0gsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQ2hGLFlBQVksRUFBRSxHQUFHO1lBQ2pCLGFBQWEsRUFBRSxhQUFhO1lBQzVCLDRCQUE0QjtZQUM1QixJQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQztRQUVILDhFQUE4RTtRQUM5RSxNQUFNLEtBQUssR0FBRyxJQUFJLHFCQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzRixNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDO1lBQzFELE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixTQUFTLEVBQUUsS0FBSyxDQUFDLFdBQVc7U0FDN0IsQ0FBQyxDQUFDO1FBRUgsV0FBVyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQztZQUN6QyxRQUFRLEVBQUUsU0FBUztZQUNuQixTQUFTLEVBQUUsY0FBYztTQUMxQixDQUFDLENBQUM7UUFDSCxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQyxnQ0FBZ0M7UUFDaEMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUMvRSxrRUFBa0U7UUFDbEUsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEtBQUssRUFBRSwySkFBMkosRUFBRSxDQUFDLENBQUE7UUFDdk4sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsRUFBRSxLQUFLLEVBQUUsb0RBQW9ELEdBQUcsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQTtJQUN4SSxDQUFDO0NBQ0Y7QUF2RUQsa0NBdUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZWMyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWMyXCI7XHJcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJ1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG4vLyBpbXBvcnQgeyBLZXlQYWlyIH0gZnJvbSAnY2RrLWVjMi1rZXktcGFpcic7XHJcbmltcG9ydCB7IEFzc2V0IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLWFzc2V0cyc7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVjMkNka1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBLZXkgUGFpciB0byBiZSB1c2VkIHdpdGggdGhpcyBFQzIgSW5zdGFuY2VcclxuICAgIC8vIFRlbXBvcmFyaWx5IGRpc2FibGVkIHNpbmNlIGBjZGstZWMyLWtleS1wYWlyYCBpcyBub3QgeWV0IENESyB2MiBjb21wYXRpYmxlXHJcbiAgICAvLyBjb25zdCBrZXkgPSBuZXcgS2V5UGFpcih0aGlzLCAnS2V5UGFpcicsIHtcclxuICAgIC8vICAgbmFtZTogJ2Nkay1rZXlwYWlyJyxcclxuICAgIC8vICAgZGVzY3JpcHRpb246ICdLZXkgUGFpciBjcmVhdGVkIHdpdGggQ0RLIERlcGxveW1lbnQnLFxyXG4gICAgLy8gfSk7XHJcbiAgICAvLyBrZXkuZ3JhbnRSZWFkT25QdWJsaWNLZXlcclxuXHJcbiAgICAvLyBDcmVhdGUgbmV3IFZQQyB3aXRoIDIgU3VibmV0c1xyXG4gICAgY29uc3QgdnBjID0gbmV3IGVjMi5WcGModGhpcywgJ1ZQQycsIHtcclxuICAgICAgbmF0R2F0ZXdheXM6IDAsXHJcbiAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFt7XHJcbiAgICAgICAgY2lkck1hc2s6IDI0LFxyXG4gICAgICAgIG5hbWU6IFwiYXN0ZXJpc2tcIixcclxuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUNcclxuICAgICAgfV1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFsbG93IFNTSCAoVENQIFBvcnQgMjIpIGFjY2VzcyBmcm9tIGFueXdoZXJlXHJcbiAgICBjb25zdCBzZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdTZWN1cml0eUdyb3VwJywge1xyXG4gICAgICB2cGMsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWxsb3cgU1NIIChUQ1AgcG9ydCAyMikgaW4nLFxyXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIHNlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoZWMyLlBlZXIuYW55SXB2NCgpLCBlYzIuUG9ydC50Y3AoMjIpLCAnQWxsb3cgU1NIIEFjY2VzcycpXHJcblxyXG4gICAgY29uc3Qgcm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnZWMyUm9sZScsIHtcclxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2VjMi5hbWF6b25hd3MuY29tJylcclxuICAgIH0pXHJcblxyXG4gICAgcm9sZS5hZGRNYW5hZ2VkUG9saWN5KGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQW1hem9uU1NNTWFuYWdlZEluc3RhbmNlQ29yZScpKVxyXG5cclxuICAgIC8vIFVzZSBMYXRlc3QgQW1hem9uIExpbnV4IEltYWdlIC0gQ1BVIFR5cGUgQVJNNjRcclxuICAgIGNvbnN0IGFtaSA9IG5ldyBlYzIuQW1hem9uTGludXhJbWFnZSh7XHJcbiAgICAgIGdlbmVyYXRpb246IGVjMi5BbWF6b25MaW51eEdlbmVyYXRpb24uQU1BWk9OX0xJTlVYXzIsXHJcbiAgICAgIGNwdVR5cGU6IGVjMi5BbWF6b25MaW51eENwdVR5cGUuQVJNXzY0XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGluc3RhbmNlIHVzaW5nIHRoZSBTZWN1cml0eSBHcm91cCwgQU1JLCBhbmQgS2V5UGFpciBkZWZpbmVkIGluIHRoZSBWUEMgY3JlYXRlZFxyXG4gICAgY29uc3QgZWMySW5zdGFuY2UgPSBuZXcgZWMyLkluc3RhbmNlKHRoaXMsICdJbnN0YW5jZScsIHtcclxuICAgICAgdnBjLFxyXG4gICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoZWMyLkluc3RhbmNlQ2xhc3MuVDRHLCBlYzIuSW5zdGFuY2VTaXplLk1JQ1JPKSxcclxuICAgICAgbWFjaGluZUltYWdlOiBhbWksXHJcbiAgICAgIHNlY3VyaXR5R3JvdXA6IHNlY3VyaXR5R3JvdXAsXHJcbiAgICAgIC8vIGtleU5hbWU6IGtleS5rZXlQYWlyTmFtZSxcclxuICAgICAgcm9sZTogcm9sZVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuIGFzc2V0IHRoYXQgd2lsbCBiZSB1c2VkIGFzIHBhcnQgb2YgVXNlciBEYXRhIHRvIHJ1biBvbiBmaXJzdCBsb2FkXHJcbiAgICBjb25zdCBhc3NldCA9IG5ldyBBc3NldCh0aGlzLCAnQXNzZXQnLCB7IHBhdGg6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9zcmMvY29uZmlnLnNoJykgfSk7XHJcbiAgICBjb25zdCBsb2NhbFBhdGggPSBlYzJJbnN0YW5jZS51c2VyRGF0YS5hZGRTM0Rvd25sb2FkQ29tbWFuZCh7XHJcbiAgICAgIGJ1Y2tldDogYXNzZXQuYnVja2V0LFxyXG4gICAgICBidWNrZXRLZXk6IGFzc2V0LnMzT2JqZWN0S2V5LFxyXG4gICAgfSk7XHJcblxyXG4gICAgZWMySW5zdGFuY2UudXNlckRhdGEuYWRkRXhlY3V0ZUZpbGVDb21tYW5kKHtcclxuICAgICAgZmlsZVBhdGg6IGxvY2FsUGF0aCxcclxuICAgICAgYXJndW1lbnRzOiAnLS12ZXJib3NlIC15J1xyXG4gICAgfSk7XHJcbiAgICBhc3NldC5ncmFudFJlYWQoZWMySW5zdGFuY2Uucm9sZSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIG91dHB1dHMgZm9yIGNvbm5lY3RpbmdcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdJUCBBZGRyZXNzJywgeyB2YWx1ZTogZWMySW5zdGFuY2UuaW5zdGFuY2VQdWJsaWNJcCB9KTtcclxuICAgIC8vIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdLZXkgTmFtZScsIHsgdmFsdWU6IGtleS5rZXlQYWlyTmFtZSB9KVxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Rvd25sb2FkIEtleSBDb21tYW5kJywgeyB2YWx1ZTogJ2F3cyBzZWNyZXRzbWFuYWdlciBnZXQtc2VjcmV0LXZhbHVlIC0tc2VjcmV0LWlkIGVjMi1zc2gta2V5L2Nkay1rZXlwYWlyL3ByaXZhdGUgLS1xdWVyeSBTZWNyZXRTdHJpbmcgLS1vdXRwdXQgdGV4dCA+IGNkay1rZXkucGVtICYmIGNobW9kIDQwMCBjZGsta2V5LnBlbScgfSlcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdzc2ggY29tbWFuZCcsIHsgdmFsdWU6ICdzc2ggLWkgY2RrLWtleS5wZW0gLW8gSWRlbnRpdGllc09ubHk9eWVzIGVjMi11c2VyQCcgKyBlYzJJbnN0YW5jZS5pbnN0YW5jZVB1YmxpY0lwIH0pXHJcbiAgfVxyXG59XHJcbiJdfQ==