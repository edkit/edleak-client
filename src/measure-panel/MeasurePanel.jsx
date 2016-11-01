import React from 'react';
import LoadButton from './LoadButton.jsx';


class MeasurePanel extends React.Component {
  constructor(props) {
    super(props);

    this.handleLoad = this.handleLoad.bind(this);
  }

  handleLoad() {
    console.log('foo');
  }

  render() {
    return (
      <LoadButton onClick={this.handleLoad} />
    );
  }
}

export default MeasurePanel;
