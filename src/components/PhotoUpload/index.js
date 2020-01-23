import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
//import AXIOS from "axios";
//import axios from "../axios-base";
//import { Image, Button, Row, Col } from "react-bootstrap";
import { compose } from "recompose";
import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification
} from "../Session";
import { withFirebase } from "../Firebase";
import * as ROLES from '../../constants/roles';
function MyDropzone(props) {


  const initial = [];
  const [addr, setAddr] = useState("");
  const [img, setImg] = useState(null);
  const [imgList, setImgList] = useState(initial);

  useEffect(() => {
    console.log("im in use effect high");
    props.firebase.images().listAll()
    .then(res=> {
      console.log("Items: ",res.items);
      console.log("Prefixes: ",res.prefixes);
      res.items.forEach(item=>{
        console.log("Item name:", item.name);
        props.firebase.image(item.name).getDownloadURL()
        .then(url=>{
          console.log("URL" ,url);
          setImgList(prevArray => [...prevArray, url]);
        })
      })
    })
    .catch(err => {
      console.log("ERROR: ",err)
    })
    
  }, []);
  //console.log("PROPS", props)


  const clickHandler = () => {
    console.log("Clicked !");
    
  }
  const onDrop = acceptedFiles => {
    // Do something with the files
   
    acceptedFiles.forEach(file => {
      console.log("FILE:  ", file)
      props.firebase.image(file.name).put(file);


    
    });
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  console.log("IMGLIST: ",imgList);
  return (
    <AuthUserContext.Consumer>
      { authUser => (
         <div>
      
         <div>
           <div
             {...getRootProps({
               onClick: clickHandler
             })}
           >
             <input {...getInputProps()} />
             {isDragActive ? (
               <p>Drop the files here ...</p>
             ) : (
               <p>Drag 'n' drop some files here, or click to select files</p>
               
             )}
           </div>
          
         </div>
              {imgList && <ul>
                {imgList.map(item => 
                  <li key= {item}>
                    <a href={item}>foto</a>
                  </li>
                )}
              </ul>

              }
     
            </div>
      )

      }
    </AuthUserContext.Consumer>
   
  );
}
// const condition = authUser =>
//   authUser && authUser.roles.includes(ROLES.ADMIN);

  const condition = authUser =>
  authUser && authUser.isAdmin;
//const condition = authUser => !!authUser;
export default compose(
  withFirebase,
  withEmailVerification,
  withAuthorization(condition)
)(MyDropzone);
//export default MyDropzone;
