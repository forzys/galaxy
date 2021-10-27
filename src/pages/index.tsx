
import React from 'react'; 
import Home from './home';

export default React.memo(()=>{
  return (
    <div>
      <h1 style={{textAlign:'center'}}>Galaxy</h1> 
      <Home />
    </div>
  );
}) 