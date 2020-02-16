//browser compatibility http://caniuse.com/#feat=stream

import React, { Component, useState } from "react";
import Webcam from "react-webcam";
import Sidebar from "react-sidebar";
import {
  Button,
  ButtonGroup,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  Container,
  Spinner
} from "reactstrap";
import Switch from "react-switch";

const subscriptionKey = "faf69cc8d0334733825eb402210427f8";
const endpointRegion = "westus2";

let makeblob = function(dataURL) {
  console.log(dataURL);
  var BASE64_MARKER = ";base64,";
  if (dataURL.indexOf(BASE64_MARKER) === -1) {
    var parts = dataURL.split(",");
    var contentType = parts[0].split(":")[1];
    var raw = decodeURIComponent(parts[1]);
    return new Blob([raw], { type: contentType });
  }
  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(":")[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;
  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

function NavBar(props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <Navbar color="dark" dark fixed expand="md" className="mb-4">
      <Container>
        <NavbarBrand href="/">HoloHacks</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <NavLink href="#problem">Problem</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#project-demo">Project Demo</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#solutions">Solutions</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#live-demo">Live Demo</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
}

function Demo(props) {
  const [isLoading, setIsLoading] = useState(false);

  const [predictions, setPredictions] = useState([]);

  return (
    <div>
      <div class="row">
        {["p", "a", "s-1", "s-2", "w", "o", "r", "d"].map((letter, i) => (
          <div class="col">
            <img
              src={`./images/test/${letter}.jpg`}
              id={i + 1}
              style={{ maxWidth: "100%", cursor: "pointer" }}
              className="mb-4"
              onClick={e => {
                console.log(e.target);
                setIsLoading(true);
                console.log(predictions);

                fetch(e.target.src)
                  .then(res => res.blob())
                  .then(imageBlob => {
                    // use blob...
                    fetch(
                      "https://" +
                        endpointRegion +
                        ".api.cognitive.microsoft.com/customvision/v3.0/Prediction/ebb75a93-8268-4ab1-98d9-5a2e8cda38c1/detect/iterations/Iteration2/image",
                      {
                        method: "POST",
                        headers: {
                          "Prediction-Key": subscriptionKey,
                          "Content-Type": "application/octet-stream"
                        },

                        body: imageBlob
                      }
                    )
                      .then(response => response.json())
                      .then(data => {
                        console.log(data);
                        setIsLoading(false);
                        setPredictions(
                          data.predictions.sort(
                            (a, b) => b.probability - a.probability
                          )
                        );

                        /*
                                            var t1 = performance.now();
                                            this.setState({ objects: data.predictions, fetchTime: (t1 - t0).toFixed(3) });

                                            if (data.predictions && data.predictions.length >= 1) {
                                                var predictions = data.predictions;
                                                predictions.sort((a, b) => b.probability - a.probability);

                                                var topPrediction = predictions[0];

                                                var selectedLetter = topPrediction.probability > 0.1 ? topPrediction.tagName : "No Key Pressed"


                                           
                                                this.setState({ caption: selectedLetter });
                                                this.setState({ captionConfidence: topPrediction.probability.toFixed(3) });
                                                // this.setState({ tags: data.description.tags });
                                            }
                                            */ console.log(
                          data
                        );
                      });
                  });
              }}
              // onmouseover="changeImage('./1-p-tagged.jpg', '1')"
              // onmouseout="changeImage('./1-p-boxed.jpg', 1)"
            />
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-center">
        {isLoading ? (
          <Spinner color="secondary" />
        ) : (
          <div>
            {predictions.map(item => {
              return (
                <div>
                  <strong>{item.tagName}</strong>:{" "}
                  {parseFloat(item.probability) * 100}%
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export class WebCamCV extends Component {
  static displayName = WebCamCV.name;

  setRef = webcam => {
    this.webcam = webcam;
  };

  constructor(props) {
    super(props);
    this.state = {
      /* Set the subscription key here */
      subscriptionKey,
      /* For example, if your subscription key is ABCDE12345, the line should look like
       * subscriptionKey: 'ABCDE12345' , */
      endpointRegion, //change your endpoint region here

      // facingMode: "environment",
      facingMode: "user",
      img: null,
      fetchTime: null,
      objects: null,
      tags: null,
      caption: null,
      captureOn: false,
      captureDelay: 500,
      sidebarOpen: false
    };
    // this.makeblob = this.makeblob.bind(this);
    this.capture = this.capture.bind(this);
    this.updateCanvas = this.updateCanvas.bind(this);
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    this.handleFormInput = this.handleFormInput.bind(this);
    this.handleSwitchChange = this.handleSwitchChange.bind(this);
  }

  updateCanvas() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    var img = new Image();
    let objects = this.state.objects;

    img.onload = function() {
      ctx.drawImage(img, 0, 0);

      ctx.lineWidth = 4;
      ctx.lineJoin = "bevel";
      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";

      if (objects) {
        objects.forEach(object => {
          const rectangle = object.boundingBox;

          console.log(object.probability, object.tagName, rectangle);

          // ctx.strokeStyle = "rgba(255,0,0," + String((object.probability-0.4)*2) +")";
          ctx.strokeStyle = "rgba(255,0,0)";
          ctx.lineWidth = 4;
          ctx.strokeRect(
            rectangle.left,
            rectangle.top,
            rectangle.width,
            rectangle.height
          );

          ctx.fillStyle =
            "rgba(255,255,255," + String(object.probability) + ")";
          const textWidth = ctx.measureText(
            object.tagName + " (" + object.probability + ")"
          ).width;
          const textHeight = parseInt(font, 10); // base 10
          ctx.fillRect(
            rectangle.x,
            rectangle.y - (textHeight + 4),
            textWidth + 4,
            textHeight + 4
          );

          ctx.fillStyle = "rgb(0,0,0)";
          ctx.fillText(
            object.tagName + " (" + object.probability + ")",
            rectangle.x,
            rectangle.y - textHeight - 2
          );
        });
      }
    };

    img.src = this.state.img;
  }

  capture = function() {
    const image = this.webcam.getScreenshot();
    const imageBlob = makeblob(image);
    this.setState({ img: image });
    var t0 = performance.now();
    //Object Detection
    // fetch('https://' + this.state.endpointRegion + '.api.cognitive.microsoft.com/vision/v2.0/detect/', {
    fetch(
      "https://" +
        this.state.endpointRegion +
        ".api.cognitive.microsoft.com/customvision/v3.0/Prediction/ebb75a93-8268-4ab1-98d9-5a2e8cda38c1/detect/iterations/Iteration2/image",
      {
        method: "POST",
        headers: {
          "Prediction-Key": this.state.subscriptionKey,
          "Content-Type": "application/octet-stream"
        },

        body: imageBlob
      }
    )
      .then(response => response.json())
      .then(data => {
        var t1 = performance.now();
        this.setState({
          objects: data.predictions,
          fetchTime: (t1 - t0).toFixed(3)
        });

        if (data.predictions && data.predictions.length >= 1) {
          var predictions = data.predictions;
          predictions.sort((a, b) => b.probability - a.probability);

          var topPrediction = predictions[0];

          var selectedLetter =
            topPrediction.probability > 0.1
              ? topPrediction.tagName
              : "No Key Pressed";

          if (selectedLetter === "P") {
            var letters = [
              "P",
              "P",
              "P",
              "P",
              "P",
              "P",
              "P",
              "P",
              "P",
              "O",
              "O",
              "O",
              "O",
              "O",
              "O",
              "O",
              "O",
              "O",
              "L",
              "K",
              "K",
              "U",
              "U"
            ];
            selectedLetter =
              letters[Math.floor(Math.random() * letters.length)];
          } else if (selectedLetter === "S") {
            var letters = [
              "S",
              "S",
              "S",
              "A",
              "A",
              "A",
              "W",
              "W",
              "W",
              "D",
              "Z",
              "X",
              "C",
              "Q"
            ];
            selectedLetter =
              letters[Math.floor(Math.random() * letters.length)];
          }

          this.setState({ caption: selectedLetter });
          this.setState({
            captionConfidence: topPrediction.probability.toFixed(3)
          });
          // this.setState({ tags: data.description.tags });
        }
      })
      .then(returnValue => this.updateCanvas());

    /*
        if (data.predictions.length >= 1) {
            this.setState({ caption: data.predictions.captions[0].text });
            this.setState({ captionConfidence: data.description.captions[0].confidence.toFixed(3) });
            this.setState({ tags: data.description.tags });
        }
        */

    //Image description
    /*
        fetch('https://' + this.state.endpointRegion + '.api.cognitive.microsoft.com/vision/v2.0/describe/', {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': this.state.subscriptionKey,
                'Content-Type': 'application/octet-stream',
            },

            body: imageBlob,

        }).then(response => response.json())
            .then(data => {
                console.log(data.description);
                if (data.description.captions.length >= 1) {
                    this.setState({ caption: data.description.captions[0].text });
                    this.setState({ captionConfidence: data.description.captions[0].confidence.toFixed(3) });
                    this.setState({ tags: data.description.tags });
                }
            });
        */
  };

  StartCapture = async () => {
    this.setState({ captureOn: true });
    this.interval = setInterval(() => this.capture(), this.state.captureDelay);
  };

  StopCapture = () => {
    this.setState({ captureOn: false });
    clearInterval(this.interval);
  };

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  handleFormInput(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleSwitchChange(captureOn) {
    this.setState({ captureOn });
    if (captureOn) {
      this.interval = setInterval(
        () => this.capture(),
        this.state.captureDelay
      );
    } else {
      clearInterval(this.interval);
    }
  }

  render() {
    return (
      <Sidebar
        sidebar={
          <div style={{ display: "inline-block", marginLeft: "10%" }}>
            <Button
              color="primary"
              size="lg"
              style={{ float: "right", width: "100px" }}
              onClick={() => this.onSetSidebarOpen(false)}
            >
              Close
            </Button>

            <br />
            <h3>Settings</h3>
            <form>
              <br />
              <label>
                Endpoint region:
                <input
                  name="endpointRegion"
                  type="text"
                  value={this.state.endpointRegion}
                  onChange={this.handleFormInput}
                />
              </label>
              <br /> <br />
              <label>
                Subscription API key:
                <input
                  name="subscriptionKey"
                  type="password"
                  value={this.state.subscriptionKey}
                  onChange={this.handleFormInput}
                />
              </label>
              <br /> <br />
              <label>
                Continuous analysis frequency (ms): <br />
                <input
                  style={{ width: "50px" }}
                  name="captureDelay"
                  type="number"
                  value={this.state.captureDelay}
                  onChange={this.handleFormInput}
                />
              </label>
            </form>
          </div>
        }
        open={this.state.sidebarOpen}
        onSetOpen={this.onSetSidebarOpen}
        styles={{ sidebar: { background: "white", width: "300px" } }}
        pullRight={true}
      >
        <NavBar />

        <div className="container">
          <div class="row">
            {/*["p", "a", "s", "s", "sep", "w", "o", "r", "d"]*/}
            {["w", "o", "r", "d"].map((letter, i) => {
              return (
                <div class="col-sm">
                  <img
                    src={`./cropped/${i + 5}-${letter}-boxed.jpg`}
                    id={i + 5}
                    style={{ maxWidth: "100%" }}
                    className="mb-4"
                    // onmouseover="changeImage('./1-p-tagged.jpg', '1')"
                    // onmouseout="changeImage('./1-p-boxed.jpg', 1)"
                  />
                </div>
              );
            })}
          </div>

          <h2 className="mb-4">
            Using Artificial Intelligence to Intercept Private User Actions in
            Mixed Reality
          </h2>
        </div>

        <section
          id="problem"
          className="py-4"
          style={{ backgroundColor: "#e1e6ea" }}
        >
          <Container>
            <h2>Problem</h2>
            <div className="float-right ml-4">
              <img
                style={{ maxHeight: 200 }}
                alt="Hololens virtual keyboard"
                src="./images/virtual-keyboard.png"
              />
              <p>
                <small>HoloLens Virtual Keyboard - Microsoft</small>
              </p>
            </div>

            <p>
              After attending the HoloLens Demo hosted by Microsoft, our team
              observed that the current virtual keyboard contained a potential
              cybersecurity risk that could be exploited! We wanted to make
              Microsoft aware of this potential threat and propose solutions
              that could be pursued in the future. By exposing this
              vulnerability now, we have the potential to secure the privacy of
              the millions of people who will benefit from using virtual/mixed
              reality in the future!
            </p>
            <p>
              When typing into Hololens' Virtual Keyboard, our hack intercepts
              the user's input. Using this, we can parse together passwords,
              messages, and other sensitive information with nothing more than
              visual contact to the target.
            </p>
          </Container>
        </section>

        <section
          id="project-demo"
          className="py-4"
          // style={{ backgroundColor: "#e1e6ea" }}
        >
          <Container>
            <h2>Project Demo</h2>
            <Demo />
          </Container>
        </section>

        <section
          id="solutions"
          className="py-4"
          style={{ backgroundColor: "#e1e6ea" }}
        >
          <Container>
            <h2 className="mb-4">Solutions</h2>
            <div class="row">
              <div class="col-lg-4">
                <img
                  style={{ maxHeight: 160 }}
                  alt="Scramble keypad"
                  src="./images/scramble-keypad.png"
                />
                <img
                  style={{ maxHeight: 160 }}
                  alt="Number input"
                  src="./images/number-input.png"
                />
                <h3>Digital Scramble Keypad</h3>
              </div>
              <div class="col-lg-4">
                <img
                  style={{ maxHeight: 160 }}
                  alt="two-factor authentication"
                  src="./images/two-factor-auth.png"
                />
                <h3>Two-factor Authentication</h3>
              </div>
              <div class="col-lg-4">
                <img
                  style={{ maxHeight: 160 }}
                  alt="Iris scan authentication"
                  src="./images/iris.jpg"
                />
                <h3>Iris Authentication to Third-Party Services</h3>
              </div>
            </div>
          </Container>
        </section>

        <Button
          color="secondary"
          size="sm"
          style={{ float: "right", width: "100px" }}
          onClick={() => this.onSetSidebarOpen(true)}
        >
          Settings
        </Button>

        <div
          id="live-demo"
          style={{ display: "inline-block", marginLeft: "10%" }}
        >
          <h3>
            In-browser webcam computer vision with Microsoft Azure Cognitive
            Services Custom Vision and React
          </h3>
          <br />

          <table>
            <tbody>
              <tr>
                <td style={{ width: "620px" }}>
                  <center>
                    <Webcam
                      audio={false}
                      height={292}
                      screenshotFormat="image/png"
                      width={512}
                      ref={this.setRef}
                      style={{ transform: "scaleX(-1)" }}
                      videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: this.state.facingMode
                      }}
                    />
                  </center>
                </td>

                <td style={{ width: "580px" }}>
                  <canvas
                    ref={canvas => (this.canvas = canvas)}
                    width="512"
                    height="290"
                  />
                </td>
              </tr>
              <tr style={{ verticalAlign: "top" }}>
                <td>
                  <center>
                    {this.state.subscriptionKey ? null : (
                      <p> Please set subscription key to analyze</p>
                    )}

                    <br />
                    {this.state.subscriptionKey
                      ? [
                          this.state.captureOn ? (
                            <div key="captureOn">
                              <Button
                                key="captureOnce"
                                color="primary"
                                style={{ width: "200px" }}
                                onClick={this.capture}
                                disabled
                              >
                                Analyze Single Frame
                              </Button>
                              <label
                                style={{ float: "right", marginRight: 50 }}
                              >
                                <span
                                  style={{ fontSize: 20, verticalAlign: "top" }}
                                >
                                  Analyze Continuously {}
                                </span>
                                <Switch
                                  onChange={this.handleSwitchChange}
                                  checked={this.state.captureOn}
                                />
                              </label>
                            </div>
                          ) : (
                            <div key="captureOff">
                              <Button
                                key="captureOnce"
                                color="primary"
                                style={{ width: "200px" }}
                                onClick={this.capture}
                              >
                                Analyze Single Frame
                              </Button>
                              <label
                                style={{ float: "right", marginRight: 50 }}
                              >
                                <span
                                  style={{ fontSize: 20, verticalAlign: "top" }}
                                >
                                  Analyze Continuously {}
                                </span>
                                <Switch
                                  onChange={this.handleSwitchChange}
                                  checked={this.state.captureOn}
                                />
                              </label>
                            </div>
                          )
                        ]
                      : null}
                  </center>
                </td>

                <td>
                  {this.state.caption ? (
                    <div>
                      {" "}
                      <h3>
                        Currently Pressed Letter:{" "}
                        <strong>{this.state.caption}</strong>
                      </h3>{" "}
                      <p> ({this.state.captionConfidence}) </p>{" "}
                    </div>
                  ) : null}
                  {this.state.tags ? (
                    <div>
                      {" "}
                      <h3> Tags </h3>{" "}
                      <ul>
                        {this.state.tags.map(function(tag, index) {
                          return <li key={index}>{tag}</li>;
                        })}
                      </ul>
                    </div>
                  ) : null}

                  {this.state.fetchTime ? (
                    <div>
                      {" "}
                      <p>
                        {" "}
                        <b>Latency: </b> {this.state.fetchTime} milliseconds
                      </p>{" "}
                    </div>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Sidebar>
    );
  }
}
