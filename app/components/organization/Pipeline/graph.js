import React from 'react';
import Relay from 'react-relay';
import moment from 'moment';

import Build from './build';
import Bar from './bar';

const PASSED_COLOR = "#B0DF21";
const RUNNING_COLOR = "#FFBA03";
const FAILED_COLOR = "#F73F23";
const PENDING_COLOR = "#DDDDDD";

const MAXIMUM_NUMBER_OF_BUILDS = 30;

const BAR_HEIGHT_MINIMUM = 3;
const BAR_WIDTH = 7;
const BAR_SEPERATOR_WIDTH = 1;
const BAR_WIDTH_WITH_SEPERATOR = BAR_WIDTH + BAR_SEPERATOR_WIDTH;

const GRAPH_HEIGHT = 35;
const GRAPH_WIDTH = (BAR_WIDTH * MAXIMUM_NUMBER_OF_BUILDS) + ((MAXIMUM_NUMBER_OF_BUILDS * BAR_SEPERATOR_WIDTH)- 1);

class Graph extends React.Component {
  static propTypes = {
    pipeline: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      builds: React.PropTypes.shape({
        edges: React.PropTypes.arrayOf(
          React.PropTypes.shape({
            node: React.PropTypes.shape({
              state: React.PropTypes.string.isRequired,
              url: React.PropTypes.string.isRequired,
              startedAt: React.PropTypes.string,
              finishedAt: React.PropTypes.string
            }).isRequired
          }).isRequired
        )
      }).isRequired
    }).isRequired
  };

  shouldComponentUpdate() {
    // Since this component updates itself, no need to re-render when the
    // parent does.
    return false;
  }

  render() {
    return (
      <div className="align-bottom relative" style={{width: GRAPH_WIDTH, height: GRAPH_HEIGHT}}>{this.renderBars()}</div>
    )
  }

  renderBars() {
    let bars = [];
    let maximumDuration = 1; // 1 to avoid a `0/0` when we calculate percentages

    for (let i = 0; i < MAXIMUM_NUMBER_OF_BUILDS; i++) {
      let buildEdge = this.props.pipeline.builds.edges[i];

      if(buildEdge) {
        let duration = this.durationForBuild(buildEdge.node);
        if(duration > maximumDuration) maximumDuration = duration;

        bars.push({ color: this.colorForBuild(buildEdge.node), duration: duration, href: buildEdge.node.url, build: buildEdge.node });
      } else {
        bars.push({ color: PENDING_COLOR, duration: 0 });
      }
    }

    return bars.map((bar, index) => {
      let left = index * BAR_WIDTH_WITH_SEPERATOR;

      let height = (bar.duration / maximumDuration) * GRAPH_HEIGHT;
      if(height < BAR_HEIGHT_MINIMUM) height = BAR_HEIGHT_MINIMUM;

      return <Bar key={index} left={left} color={bar.color} width={BAR_WIDTH} height={height} href={bar.href} build={bar.build} />
    })
  }

  durationForBuild(build) {
    if(build.startedAt) {
      // Passing `null` to moment will result in a blank moment instance, so if
      // there isn't a finishedAt, just switch to undefined.
      return moment(build.finishedAt || undefined).diff(moment(build.startedAt));
    } else {
      return 0;
    }
  }

  colorForBuild(build) {
    if(build.state == "running") {
      return RUNNING_COLOR;
    } else if (build.state == "passed" ) {
      return PASSED_COLOR;
    } else {
      return FAILED_COLOR;
    }
  }
}

export default Relay.createContainer(Graph, {
  fragments: {
    pipeline: () => Relay.QL`
      fragment on Pipeline {
        id
        builds(first: 30, state: [ BUILD_STATE_RUNNING, BUILD_STATE_PASSED, BUILD_STATE_FAILED, BUILD_STATE_CANCELED, BUILD_STATE_CANCELING ]) {
          edges {
            node {
              state
              url
              startedAt
              finishedAt
              ${Build.getFragment('build')}
            }
          }
        }
      }
    `
  }
});