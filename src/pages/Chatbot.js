import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../utils/supabaseClient'; // Import Supabase client
import './Chatbot.css';

const Chatbot = () => {
    const [response, setResponse] = useState('');
    const [userInput, setUserInput] = useState('');
    const [courses, setCourses] = useState([]); // State to store courses
    const [loading, setLoading] = useState(true); // Loading state
    const [messages, setMessages] = useState([]); // State to store chat messages

    // Fetch courses from Supabase
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data, error } = await supabase
                    .from('courses')
                    .select('*');

                if (error) throw error;
                setCourses(data); // Set courses data
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false); // Set loading to false
            }
        };

        fetchCourses();
    }, []);

    const handleSendMessage = async () => {
        if (!userInput.trim()) return; // Ignore empty input

        // Add user's message to the chat
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: userInput, sender: 'user' },
        ]);

        // Clear input field
        setUserInput('');

        // Generate chatbot response
        if (!loading) {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI("AIzaSyCyNkoKLzU2py1Z3b2zX_Tk-iSlFelmCB0");
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            // Prepare course information for the prompt
            const courseInfo = courses.map(course => `
                Title: ${course.title},
                Description: ${course.description},
                Price: ₹${course.price},
                Duration: ${course.duration_hours} hours,
                Lectures: ${course.total_lectures}
            `).join('\n');

            const prompt = `
                You are an assistant for Udemy, a website that sells courses. 
                You are given a question by the user and you are to provide a short and simple answer understandable by the user. 
                Greet the user. Your name is Kelly. 
                Here is the list of available courses:
                ${courseInfo}
                User Query: ${userInput}
            `;

            try {
                const result = await model.generateContent(prompt);
                const botResponse = result.response.text();

                // Add chatbot's response to the chat
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: botResponse, sender: 'bot' },
                ]);
            } catch (error) {
                console.error("Error generating content:", error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: "Sorry, I couldn't process your request.", sender: 'bot' },
                ]);
            }
        }
    };

    if (loading) {
        return <p>Loading courses...</p>; // Show loading message
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="chatbot-container">
            <div className="chatbot-header">
                <h1>Kelly Chatbot</h1>
            </div>
            <div className="chatbot-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        {message.text}
                    </div>
                ))}
            </div>
            <div className="chatbot-input">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your question..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
        </div>
        
    );
};

export default Chatbot;