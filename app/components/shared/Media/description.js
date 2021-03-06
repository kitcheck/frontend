import React from "react";

class Description extends React.Component {
  static propTypes = {
    children: React.PropTypes.node.isRequired,
    className: React.PropTypes.string
  };

  render() {
    return (
      <div className={this.props.className}>
        {this.props.children}
      </div>
    );
  }
}

export default Description;
