import React from "react";
 const SampleTest =() => {

    const img1 = "https://i0.wp.com/indiacurrents.com/wp-content/uploads/2021/08/1599px-The_Charminar_on_a_cloudy_day.jpeg?fit=785%2C515&ssl=1";
    const img2 = "https://www.planetware.com/wpimages/2019/09/top-places-to-visit-in-the-world-manhattan-new-york.jpg";
    const img3 = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAkZFtytms073Aagxoe8DdLxpBtGVR_T576Q&usqp=CAU";
    const img4 = "https://www.planetware.com/wpimages/2019/09/top-places-to-visit-in-the-world-london-england.jpg"


    return(
        <div>
        <img src ={img1} alt ="Random images" style={{width :"350px", height : "400px"}}></img>
        <img src ={img2} alt ="Random images" style={{width :"350px", height : "400px"}}></img>
        <img src ={img3} alt ="Random images" style={{width :"360px", height : "400px"}}></img>
        <img src ={img4} alt ="Random images" style={{width :"280px", height : "400px"}}></img>
        </div>
    )
}
export default SampleTest;