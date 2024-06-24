import axios from 'axios';
import dbConnect from '../../lib/mongo';
import Specials from '../../models/Specials';

export default async function handler(req, res) {
  try {
    await dbConnect();

    const { body } = req;
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-type': 'application/json',
       'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    };

    // First AI Call to analyze the user input for the city and keywords
    const firstAIData = {
      model: "gpt-3.5-turbo-0301",
      messages: [
        { "role": "user", "content": body.messages[0].content },
        { "role": "assistant", "content": "You are the first AI call in my chat bot algorithm, your job is to analyze the user prompt and give a result in only 1-3 words. because im going to use that word/s to query into the database, don't mix the food with descriptive word, always use comma. Example user prompt 'Beer specials in Sydney', the return should be sydney, beer, specials. Always sort it to City, Food, descriptive word. Instruction to follow: Respond strictly based on the return codes provided below. Avoid explanations; be direct in your responses. If the user's input contains an address, analyze it and pinpoint one specific city in Australia. Return the city. If the user's input does not contain an address but contains a food/drinks, return the food/drinks name. For example, if the user mentions 'pizza', return 'pizza'. If the user's input neither contains an address nor a food/drinks, analyze it for a descriptive word. Return the descriptive word. For example, if the user asks 'can you give me a happy hour', return 'happy hour'. If the user's input contains both an address and a food, convert the address to a specific city and return 'city, food'. If user prompt has descriptive words and food/drinks return food/drinks, always separate it with comma, descriptive word, example if user prompt 'Beer specials in Sydney' return beer, specials.If the user's input does not contain a food, descriptive text, or address, return '404'." }
      ]
    };

    const firstAIResponse = await axios.post(url, firstAIData, { headers });
    const userQuery = firstAIResponse.data.choices[0].message.content.toLowerCase().trim();

    // Extract city and keywords from user query
    const userCity = extractCityFromResponse(userQuery);
    const keywords = extractKeywordsFromResponse(userQuery);

    // MongoDB query to find specials based on city, keywords, and publish status
    const specials = await Specials.find({
      $and: [
        {
          $or: [
            { 'venueMeta.city': userCity },
            { 'venueMeta.venue.title': { $regex: userCity, $options: 'i' } } // Check if title contains userCity
          ]
        },
        { status: 'publish' },
        {
          $or: [
            { title: { $regex: keywords.join('|'), $options: 'i' } },
            { content: { $regex: keywords.join('|'), $options: 'i' } }
          ]
        }
      ]
    }).limit(3);

    if (!specials.length) {
      res.status(200).json({ choices: [{ message: { content: `Sorry, no specials found for '${userQuery}' in ${userCity}.` } }] });
      return;
    }

    // Format specials into response
    const specialsList = specials.map(special => ({
      title: special.title,
      venue: special.venueMeta.venue.title,
      url: `https://thehappiesthour.com/venue/${special.venueMeta.cityObj.slug}/${special.venueMeta.venue.slug}`,
      content: special.content
    }));

    const responseMessage = `Here are some specials in ${userCity} for '${userQuery}':\n\n${specialsList.map(s => `- ${s.title} at ${s.venue}: ${s.content}\n   URL: ${s.url}`).join('\n\n')}`;

    res.status(200).json({ choices: [{ message: { content: responseMessage } }] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

function extractCityFromResponse(responseContent) {
  const parts = responseContent.split(',');
  return parts[0].trim();
}

function extractKeywordsFromResponse(responseContent) {
  const parts = responseContent.split(',');
  return parts.slice(1).map(keyword => keyword.trim());
}
