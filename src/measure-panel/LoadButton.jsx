import React from 'react';
import { Icon } from 'semantic-ui-react';


class LoadButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    if(this.props.onClick != undefined) {
      this.props.onClick();
    }
  }

  render() {

    const divStyle = {
      display: "inline-block",
      width: "50px",
      height: "50px"
    };

    const fileStyle = {
      width: "0px",
      height: "0px",
      overflow: "hidden"
    };

    return (
      <span style={divStyle}>
        <input type="file" style= {fileStyle} />
        <Icon name='upload' size='large' onClick={this.handleClick}/>
      </span>
    );
  }
}

export default LoadButton;
