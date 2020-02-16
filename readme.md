## Inspiration

_On average, 65% of people think that artificial reality will become a part of everyday life. [link](https://www.facebook.com/business/news/insights/3-things-marketers-need-to-know-about-ar-and-vr)_

After attending the HoloLens Demo hosted by Microsoft, our team observed that the current virtual keyboard contained a **cybersecurity risk** that could be **exploited!** Assuming the role of _white-hat hackers_, we wanted to make Microsoft aware of this **potential threat** and propose solutions that could be pursued in the **future**.

Even though the field of virtual/mixed reality continues to **grow**, we are not yet sure how many devices can--and will--be **hacked**. By exposing this vulnerability now, we have the **potential** to save the **millions** of people who will benefit from using virtual/mixed reality!

## What it does

When typing into **Hololens' Virtual Keyboard**, our hack intercepts the user's input. Using this, we can parse together passwords, messages, and other sensitive information with nothing more than visual contact to the target.

## How we built it

Client-Side: Javascript, HTML5, CSS, React, Microsoft Hololens, Microsoft Cognitive Services Vision Solutions Template
Server-Side: Microsoft Azure Custom Vision

## Challenges we ran into

- Distinguishing user input - especially when a password had letters that were close together on the virtual keyboard
- Because we did not have access to a **Kinect**, we were not able to use **Microsoft Project Gesture** to accurately identify gestures, especially when taking videos or images
- Processing big data -it was time-consuming to take in, parse, and tag over fifteen images from every letter

## Accomplishments that we're proud of

We are proud that we were able to detect a genuine **cybersecurity risk**, create a demo that represented the risk, and propose potential **solutions** to mitigate the problem. We were also proud that we implemented hardware and balanced diverse skillsets for our project.

## What we learned

We learned how to use **Azure Custom Vision's Object Detection Services** to detect unique hand signals. Previously, we had only used Azure Custom Vision to conduct a basic A/B test, and the challenge of determining different hand gestures that were fairly similar to each other was a time-consuming process.

We learned how to take a picture from a website and return its result. This involved using **Postman** to post our images to our Azure Custom Vision **Prediction API**. Furthermore, we used Microsoft Cognitive Services Vision Solutions Template to post a video of us typing the password in **real-time**.

Finally, we learned about the business challenge of not only presenting a problem and its demo but also proposing potential solutions. We wanted our project to exist under a realistic business scenario, and that involved having an impact even after TreeHacks had ended.

## What's next for HoloHacks

- Use **linguistic analysis** to determine where the virtual keyboard is, increasing the accuracy of guessing the password
- Use **Microsoft Project Gesture** to better target the unique gestures used to press each key
- Increase the dataset of potential users to make the project more **inclusive** and **accurate**. (Our dataset currently includes the hand gestures from one right-handed person. We would need thousands of inputs to make our project scalable.)
