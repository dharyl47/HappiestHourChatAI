// pages/api/chat.js
import axios from 'axios';
import dbConnect from '../../lib/mongo';
import Venue from '../../models/Venue';

export default async function handler(req, res) {
  try {
    await dbConnect();

    const { body } = req;
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
    };

    // First AI Call to analyze the user input for the city
    const firstAIData = {
      model: "gpt-3.5-turbo-0301",
      messages: [
        { "role": "user", "content": body.messages[0].content },
        { "role": "assistant", "content": "Analyze the text and identify the city. If the city is in Australia, respond with only the city name. If the city is not in Australia, find the corresponding city in Australia based on the address and respond with only that city name. If no city name is found, respond with 404 only." }
      ]
    };

    const firstAIResponse = await axios.post(url, firstAIData, { headers: headers });
    const userCity = extractCityFromResponse(firstAIResponse.data.choices[0].message.content);
    console.log("userCity", userCity)
    if (userCity==="404") {
      // If first AI fails to determine the city, prompt user to provide city information
      res.status(200).json({ choices: [{ message: { content: "Sorry, can you specify the city you're looking for a venue in?" } }] });
      return;
    }

    // Second API Call to retrieve venue recommendations from MongoDB
    const venues = await Venue.find({ 
      'metaForSearch.city.slug': userCity, 
      content: { $exists: true, $ne: "" } 
    }).limit(3);

    if (!venues.length) {
      res.status(200).json({ choices: [{ message: { content: "Sorry, I don't have recommendations for that city yet." } }] });
      return;
    }

    // Format venue recommendations into a readable list
    const venueRecommendations = venues.map(venue => ({
      name: venue.title,
      url: `https://thehappiesthour.com/venues/${venue.metaForSearch.city.slug}/${venue.slug}`,
      content: venue.content
    }));

    const venueList = venueRecommendations.map(v => `- [${v.name}](${v.url}): ${v.content}`).join('\n\n');

    // Construct assistant response with formatted recommendations
    const assistantResponse = `Here are some great venues in ${userCity.charAt(0).toUpperCase() + userCity.slice(1)}:\n\n${venueList}`;

    res.status(200).json({ choices: [{ message: { content: assistantResponse } }] });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

function extractCityFromResponse(responseContent) {
  // Implement your logic here to extract the city from the AI response
  // This could involve regular expressions, string parsing, or any other suitable method
  return responseContent.trim().toLowerCase(); // Placeholder logic, adjust as per your actual AI response structure
}
