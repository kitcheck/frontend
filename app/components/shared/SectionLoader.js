import React from 'react';

import Spinner from './spinner';

class SectionLoader extends React.Component {
  render() {
    return (
      <div className="center mt4">
        <Spinner/>
      </div>
    );
  }
}

export default SectionLoader
