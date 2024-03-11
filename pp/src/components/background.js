import React from "react";
import './background.css';
import Header from "./header";
import Text from "./text";
import Imgg from "./img";
// import img1 from './img1.png';

function Bg() {
    return(
        <div className="bg">
            <Header/>
            <Text/>
            <Imgg/>
        </div>
    )
}

export default Bg;