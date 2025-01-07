import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

interface DatabaseStackProps extends cdk.StackProps {
  stackName: string;
  vpc: ec2.Vpc;
  selectedSubnets: ec2.SelectedSubnets;
}

export default class DatabaseStack extends cdk.Stack {
  public readonly aurora: rds.DatabaseCluster;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    const { stackName, vpc, selectedSubnets } = props;

    super(scope, id, {
      ...props,
      stackName,
    });

    // 勉強目的のため、Auroraに対して全てのIPアドレスからのMySQL（ポート3306）接続を許可する。
    const securityGroup = new ec2.SecurityGroup(this, 'AuroraSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for Aurora database',
    });
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3306),
      'Allow MySQL access from anywhere'
    );

    const aurora = new rds.DatabaseCluster(this, 'MyAurora', {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_04_0
      }),
      vpc,
      vpcSubnets: selectedSubnets,
      deletionProtection: false,
      defaultDatabaseName: process.env.AURORA_DATABASE_NAME!,
      writer: rds.ClusterInstance.provisioned('Writer', {
        instanceType: ec2.InstanceType.of(
          // `rds.AuroraMysqlEngineVersion.VER_3_04_0`は`t3.medium`以上のみ選択可能。
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MEDIUM
        ),
        publiclyAccessible: true,
      }),
      // IAM認証を有効にする。
      iamAuthentication: true,
      // 節約のために読み取り専用インスタンスは作成しない。
      readers: [],
      securityGroups: [securityGroup],
    });

    this.aurora = aurora;
  }
}
