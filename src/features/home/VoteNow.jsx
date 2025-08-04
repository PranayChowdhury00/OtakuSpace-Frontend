import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import TimeAgo from "react-timeago";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import { AuthContext } from "../../context/authContext";

const VoteNow = () => {
  const [activeTab, setActiveTab] = useState("topics");
  const [topics, setTopics] = useState([]);
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicInput, setTopicInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [activeTopic, setActiveTopic] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useContext(AuthContext);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "anime") {
          const animeRes = await axios.get("https://api.jikan.moe/v4/top/anime?limit=20");
          setAnimeList(animeRes.data.data);
        } else {
          const topicsRes = await axios.get("http://localhost:5000/api/topics");
          setTopics(topicsRes.data.map(topic => ({
            ...topic,
            author: topic.authorId,
            votes: topic.upvotes - topic.downvotes
          })));
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", `Failed to fetch ${activeTab === "anime" ? "anime list" : "discussion topics"}`, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Fetch full topic details when activeTopic changes
  useEffect(() => {
    if (activeTopic?._id) {
      const fetchTopicDetails = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/topics/${activeTopic._id}`);
          setActiveTopic({
            ...res.data,
            comments: res.data.comments || []
          });
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Failed to load topic details", "error");
        }
      };
      fetchTopicDetails();
    }
  }, [activeTopic?._id]);

  const handleVote = async (type, id, direction) => {
    if (!user) {
      return Swal.fire("Login Required", "Please login to vote.", "warning");
    }

    try {
      if (type === "anime") {
        const anime = animeList.find((a) => a.mal_id === id);
        const voteData = {
          animeId: anime.mal_id,
          title: anime.title,
          image: anime.images.jpg.image_url,
          userEmail: user.email,
        };

        const res = await axios.post("http://localhost:5000/vote", voteData);
        if (res.data.message === "You already voted") {
          Swal.fire("Already Voted", "You already voted for this anime.", "info");
        } else {
          Swal.fire("Voted!", "Thanks for your vote!", "success");
          setAnimeList((prev) =>
            prev.map((a) => (a.mal_id === id ? { ...a, voted: true } : a))
          );
        }
      } else if (type === "topic") {
        await axios.post(`http://localhost:5000/api/topics/${id}/vote`, {
          userId: user.email,
          direction,
        });

        // Optimistically update UI
        const updateVotes = (prev) => ({
          ...prev,
          upvotes: direction === "up" ? prev.upvotes + 1 : prev.upvotes,
          downvotes: direction === "down" ? prev.downvotes + 1 : prev.downvotes,
          votes: direction === "up" 
            ? prev.votes + 1 
            : direction === "down" 
              ? prev.votes - 1 
              : prev.votes
        });

        setTopics(prev =>
          prev.map(topic =>
            topic._id === id ? updateVotes(topic) : topic
          )
        );

        if (activeTopic && activeTopic._id === id) {
          setActiveTopic(prev => updateVotes(prev));
        }
      } else if (type === "comment") {
        await axios.post(`http://localhost:5000/api/comments/${id}/vote`, {
          userId: user.email,
          direction,
        });

        // Refresh active topic to get updated comment votes
        if (activeTopic) {
          const res = await axios.get(
            `http://localhost:5000/api/topics/${activeTopic._id}`
          );
          setActiveTopic(res.data);
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to submit vote. Please try again.", "error");
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!topicInput.trim() || isSubmitting) return;
    if (!user) {
      return Swal.fire("Login Required", "Please login to create topics.", "warning");
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post("http://localhost:5000/api/topics", {
        title: topicInput,
        authorId: user.email,
        content: "",
        tags: [],
      });

      const newTopic = {
        ...res.data,
        author: user.username || user.email.split("@")[0],
        comments: [],
        votes: 0,
        userVote: null,
        commentsCount: 0,
        upvotes: 0,
        downvotes: 0
      };

      setTopics(prev => [newTopic, ...prev]);
      setActiveTopic(newTopic);
      setTopicInput("");
      Swal.fire("Success", "Your topic has been created!", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to create topic. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmitting) return;
    if (!user) {
      return Swal.fire("Login Required", "Please login to comment.", "warning");
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/topics/${activeTopic._id}/comments`,
        {
          content: commentInput,
          authorId: user.email,
        }
      );

      const newComment = {
        ...res.data,
        author: user.username || user.email.split("@")[0],
        votes: 0,
        userVote: null
      };

      // Update active topic
      setActiveTopic(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
        commentsCount: (prev.commentsCount || 0) + 1
      }));

      // Update topics list
      setTopics(prev =>
        prev.map(topic =>
          topic._id === activeTopic._id
            ? {
                ...topic,
                commentsCount: (topic.commentsCount || 0) + 1
              }
            : topic
        )
      );

      setCommentInput("");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to add comment. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6 text-center">Anime Community Hub</h2>

      <div className="tabs tabs-boxed justify-center mb-8">
        <button
          className={`tab ${activeTab === "topics" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("topics")}
        >
          Discussion Topics
        </button>
        <button
          className={`tab ${activeTab === "anime" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("anime")}
        >
          Anime Votes
        </button>
      </div>

      {activeTab === "topics" ? (
        <div className="space-y-6">
          <form onSubmit={handleCreateTopic} className="bg-base-200 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Start a Discussion</h3>
            <input
              type="text"
              className="input input-bordered w-full mb-3"
              placeholder="Your topic..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Topic"}
            </button>
          </form>

          {activeTopic ? (
            <div className="bg-base-100 rounded-xl shadow-lg p-6">
              <button
                className="btn btn-sm btn-ghost mb-4"
                onClick={() => setActiveTopic(null)}
                disabled={isSubmitting}
              >
                ← Back
              </button>
              <h3 className="text-2xl font-bold mb-2">{activeTopic.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Posted by {activeTopic.author} •{" "}
                <TimeAgo date={activeTopic.createdAt} /> •{" "}
                {activeTopic.commentsCount || 0} comments •{" "}
                {activeTopic.upvotes - activeTopic.downvotes} votes
              </p>

              <div className="flex gap-2 mb-4">
                <button
                  className={`btn btn-sm ${activeTopic.userVote === "up" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => handleVote("topic", activeTopic._id, "up")}
                  disabled={isSubmitting}
                >
                  <FaThumbsUp /> {activeTopic.upvotes}
                </button>
                <button
                  className={`btn btn-sm ${activeTopic.userVote === "down" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => handleVote("topic", activeTopic._id, "down")}
                  disabled={isSubmitting}
                >
                  <FaThumbsDown /> {activeTopic.downvotes}
                </button>
              </div>

              <form onSubmit={handleAddComment} className="mb-6">
                <textarea
                  className="textarea textarea-bordered w-full mb-2"
                  placeholder="Add your comment..."
                  rows={3}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
              </form>

              <div className="space-y-4">
                {activeTopic.comments?.map((comment) => (
                  <div key={comment._id} className="bg-base-200 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <div>
                        <span className="font-semibold">{comment.author}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          <TimeAgo date={comment.createdAt} />
                        </span>
                      </div>
                    </div>
                    <p>{comment.content}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <button
                        className={`${comment.userVote === "up" ? "text-primary" : ""}`}
                        onClick={() => handleVote("comment", comment._id, "up")}
                        disabled={isSubmitting}
                      >
                        <FaThumbsUp size={12} /> {comment.upvotes}
                      </button>
                      <button
                        className={`${comment.userVote === "down" ? "text-primary" : ""}`}
                        onClick={() => handleVote("comment", comment._id, "down")}
                        disabled={isSubmitting}
                      >
                        <FaThumbsDown size={12} /> {comment.downvotes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div
                  key={topic._id}
                  className="bg-base-100 p-6 rounded-xl shadow hover:shadow-md cursor-pointer"
                  onClick={() => !isSubmitting && setActiveTopic(topic)}
                >
                  <div className="flex justify-between">
                    <h3 className="text-xl font-semibold">{topic.title}</h3>
                    <div className="flex gap-2 items-center text-sm text-gray-500">
                      <span>{topic.upvotes - topic.downvotes} votes</span>
                      <span>•</span>
                      <span>{topic.commentsCount || 0} comments</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Posted by {topic.author} •{" "}
                    <TimeAgo date={topic.createdAt} />
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animeList.map((anime) => (
            <div
              key={anime.mal_id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <figure>
                <img
                  src={anime.images.jpg.image_url}
                  alt={anime.title}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title">{anime.title}</h3>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleVote("anime", anime.mal_id, "up")}
                    disabled={isSubmitting}
                  >
                    Vote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoteNow;