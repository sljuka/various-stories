import * as React from "react";
import {
  BaseEvent,
  ListenerHandle,
  PeformanceWidget
} from "@projectstorm/react-canvas-core";
import {
  DiagramEngine,
  LinkModel,
  PortModel,
  PointModel
} from "@projectstorm/react-diagrams";

export interface LinkProps {
  link: LinkModel;
  diagramEngine: DiagramEngine;
}

export interface LinkState {
  sourcePort: PortModel;
  targetPort: PortModel;
}

export class LinkWidget extends React.Component<LinkProps, LinkState> {
  sourceListener: ListenerHandle;
  targetListener: ListenerHandle;

  constructor(props: any) {
    super(props);
    this.state = {
      sourcePort: null,
      targetPort: null
    };
  }

  componentWillUnmount(): void {
    if (this.sourceListener) {
      this.sourceListener.deregister();
    }
    if (this.targetListener) {
      this.targetListener.deregister();
    }
  }

  static getDerivedStateFromProps(
    nextProps: LinkProps,
    prevState: LinkState
  ): LinkState {
    return {
      sourcePort: nextProps.link.getSourcePort(),
      targetPort: nextProps.link.getTargetPort()
    };
  }

  installTarget() {
    this.targetListener && this.targetListener.deregister();
    this.targetListener = this.props.link.getTargetPort().registerListener({
      reportInitialPosition: (event: BaseEvent) => {
        this.forceUpdate();
      }
    });
  }

  installSource() {
    this.sourceListener && this.sourceListener.deregister();
    this.sourceListener = this.props.link.getSourcePort().registerListener({
      reportInitialPosition: (event: BaseEvent) => {
        this.forceUpdate();
      }
    });
  }

  componentDidUpdate(
    prevProps: Readonly<LinkProps>,
    prevState: Readonly<LinkState>,
    snapshot: any
  ) {
    if (prevState.sourcePort !== this.state.sourcePort) {
      this.installSource();
    }
    if (prevState.targetPort !== this.state.targetPort) {
      this.installTarget();
    }
  }

  public static generateLinePath(
    firstPoint: PointModel,
    lastPoint: PointModel
  ): string {
    return `M${firstPoint.getX()},${firstPoint.getY()} L ${lastPoint.getX()},${lastPoint.getY()}`;
  }

  componentDidMount(): void {
    if (this.props.link.getSourcePort()) {
      this.installSource();
    }
    if (this.props.link.getTargetPort()) {
      this.installTarget();
    }
  }

  render() {
    const { link } = this.props;

    // only draw the link when we have reported positions
    if (link.getSourcePort() && !link.getSourcePort().reportedPosition) {
      return null;
    }
    if (link.getTargetPort() && !link.getTargetPort().reportedPosition) {
      return null;
    }

    //generate links
    return (
      <PeformanceWidget
        model={this.props.link}
        serialized={this.props.link.serialize()}
      >
        {() => {
          return (
            <g data-linkid={this.props.link.getID()}>
              {this.props.diagramEngine.generateWidgetForLink(link)}
            </g>
          );
        }}
      </PeformanceWidget>
    );
  }
}
