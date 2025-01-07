import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

interface OutputStackProps extends cdk.StackProps {
  stackName: string;
  aurora: rds.DatabaseCluster;
}

export default class OutputStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: OutputStackProps) {
    const { stackName, aurora } = props;

    super(scope, id, {
      ...props,
      stackName,
    });

    new cdk.CfnOutput(this, 'AuroraEndpoint', {
      value: aurora.clusterEndpoint.hostname,
    });

    new cdk.CfnOutput(this, 'AuroraPort', {
      value: aurora.clusterEndpoint.port.toString(),
    });

    const secret = aurora.secret?.secretName;
    if (secret != null) {
      new cdk.CfnOutput(this, 'AuroraSecret', {
        value: secret,
      });
    }
  }
}
