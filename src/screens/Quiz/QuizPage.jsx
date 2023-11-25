import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadQuizQuestions, quizSubmit } from "../../redux/action";
import Radio from "@mui/material/Radio";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Modal,
  RadioGroup,
} from "@mui/material";
import GLOBAL_CONSTANTS from "../../../GlobalConstants";
import Lottie from "react-lottie-player";
import PassAnimation from "../../assets/animation_pass.json";
import FailAnimation from "../../assets/animation_fail.json";
import LoadingAnimation from "../../assets/animation_loading.json";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import QuizResults from "./QuizResults";

export default function QuizPage({ id, setValue }) {
  const { quizView } = useSelector((state) => state.data);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [results, setResults] = useState(null);
  const [totalScore, settotalScore] = useState(null);
  const [totalMarks, setTotalMarks] = useState(null);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState({});
  const [questions, setQuestions] = useState([]);

  const [viewresults, setViewResults] = useState(false);

  // Timer-related state
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const quizDuration = 60 * 30; // 30 minutes in seconds ,here we can change total time.

  const dispatch = useDispatch();

  const handleChange = (index, selectedValue) => {
    let temp = [...questions];
    temp = temp?.map((o, ind) => {
      if (ind === index) o.selected_option = [parseInt(selectedValue) + 1];
      return o;
    });
    setQuestions(() => [...temp]);
    console.log(temp, "onChange");
  };

  const handleChangeClose = () => {
    setOpen(false);
    navigate("/lessons");
  };

  const onSubmit = () => {
    setOpen(true);
    const payload = {
      user_id: GLOBAL_CONSTANTS?.user_cred?.user_id,
      quiz_id: id,
      content: questions?.map((o) => ({
        question_id: o?.id,
        selected_options: o?.selected_option,
      })),
    };
    dispatch(quizSubmit(payload, (resp) => {
      console.info(resp, "results");
      setResults(() => resp?.is_qualified);
      settotalScore(() => resp?.score);
      setTotalMarks(() => resp?.total_marks);
      clearInterval(timer); // Stop the timer when submitting
    }));
  };

  useEffect(() => {
    dispatch(loadQuizQuestions(id));
  }, []);

  useEffect(() => {
    console.info(results, "results");
  }, [results]);

  useEffect(() => {
    if (quizView?.questions?.length) {
      let temp = quizView?.questions?.map((o) => ({
        id: o?.id,
        question: o?.content?.questions,
        options: o?.content?.options,
        is_mandatory: o?.content?.is_mandatory,
        marks: o?.content?.marks,
        correct_option: o?.content?.correct_option ?? [],
        selected_option: [],
      }));
      setQuestions(() => [...temp]);
    }
  }, [quizView]);

  useEffect(() => {
    if (questions?.length) {
      setActiveQuestion(questions[activeQuestionIndex]);
    }
  }, [activeQuestionIndex, questions]);

  const isUrl = (option) => {
    return option.startsWith("http://") || option.startsWith("https://");
  };
//Here is the code for timer 111 to 136 line - Baswaraj
  useEffect(() => {
    // Start the timer when quizView is available
    if (quizView && !timer) {
      const endTime = Date.now() + quizDuration * 1000;
      setTimer(
        setInterval(() => {
          const now = Date.now(); 
          const timeRemaining = Math.floor((endTime - now) / 1000);
          setTimeLeft(timeRemaining);
          //in below if condition if time left below or equal to 60,then warning message displays in browser.
          if (timeRemaining <= 60) {
            setShowWarning(true);
          }
          //if time left is 0 sec ,autosubmit will happen
          if (timeRemaining <= 0) {
            clearInterval(timer);
            setTimeLeft(0); // Set timeLeft to 0 when it reaches zero
            onSubmit(); // Auto-submit quiz when time expires
          }
        }, 1000)
      );
    }

    return () => clearInterval(timer); // Clear the timer on unmount
  }, [timer, quizView]);

  return (
    viewresults ? (
      <QuizResults questions={questions} pass={results} total_score={totalScore} total_marks={totalMarks} />
    ) : (
      <>
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between font-custom_1 text-xl font-semibold">
            <div>{quizView?.title}</div>
            <div className="flex gap-4" >
              {/* Displaying  the timer in the top right corner */}
              <div style={{ position: 'fixed', top: '2px', right: '2px', backgroundColor: '#2196F3', padding: '8px', borderRadius: '4px', color: 'white',height:'60px' }}>
                {showWarning && <div style={{ color: 'red' }}>Time is running out!</div>}
                  {timeLeft !== null && (
                  // <div>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}</div>
                  <div>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toLocaleString(undefined, { minimumIntegerDigits: 2, useGrouping: false })}</div>
                )}
              </div>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setValue("1");
                }}
              >
                {" "}
                End Test{" "}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  onSubmit();
                }}
              >
                {" "}
                Submit{" "}
              </Button>
            </div>
          </div>
          <div className="w-full h-full flex flex-col md:grid md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-4 w-full h-full p-4 rounded bg-purple-200 md:col-span-2">
              <div className="text-lg font-medium">
                {activeQuestion?.question}
              </div>

              <div className="grid gap-y-4 w-full h-full rounded bg-purple-200 md:col-span-2">
                {activeQuestion?.correct_option?.length === 1 ? (
                  <FormControl style={{ width: "100%" }}>
                    <RadioGroup
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      value={
                        activeQuestion?.selected_option?.length
                          ? activeQuestion?.selected_option[0] - 1
                          : null
                      }
                      onChange={(e, val) =>
                        handleChange(activeQuestionIndex, val)
                      }
                      className="w-full"
                    >
                      <div className="grid gap-y-4 items-center ">
                        {activeQuestion?.options?.map((o, ind) => (
                          <div key={ind} className="col-span-1">
                            <FormControlLabel
                              value={ind}
                              control={<Radio />}
                              label={
                                isUrl(o) ? (
                                  <img src={o} alt="Option" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                                ) : (
                                  o
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </FormControl>
                ) : (
                  <></>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  disabled={activeQuestionIndex === 0 ? true : false}
                  onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
                >
                  Prev
                </Button>
                <Button
                  color="secondary"
                  variant="contained"
                  size="small"
                  disabled={
                    activeQuestionIndex === questions?.length - 1 ? true : false
                  }
                  onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="w-full h-full p-4 rounded bg-purple-200 hidden md:block">
              <div
                className="gap-2"
                style={{
                  display: "grid",
                  alignItems: "center",
                  gridTemplateColumns: "repeat( auto-fill ,minmax(30px,1fr))",
                }}
              >
                {questions.map((o, index) => (
                  <div
                    className={`flex justify-center items-center text-center rounded p-2 cursor-pointer ${index === activeQuestionIndex
                        ? "border border-purple-600 bg-gray-200 text-black"
                        : o?.selected_option?.length
                          ? " border border-green-600 bg-green-600 "
                          : "border border-purple-600 bg-purple-600 text-white"
                      }`}
                    key={index}
                    onClick={() => {
                      setActiveQuestionIndex(index);
                    }}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {open && (
          <Modal
            open={open}
            onClose={() => {
              handleChangeClose();
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => {
                handleChangeClose();
              }}
            >
              <Box
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  padding: "10px",
                  width: "calc(min(600px,100%))",
                  minHeight: "60vh",
                  height: "max-content",
                  overflow: "hidden"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {results === null ? (
                  <Lottie
                    loop
                    animationData={LoadingAnimation}
                    play
                  />
                ) : (
                  results ? (
                    <div className="flex flex-col gap-4 items-center justify-center" >
                      <Lottie
                        loop
                        animationData={PassAnimation}
                        play
                        style={{ width: "80%" }}
                      />
                      <div className="text-3xl font-bold text-white"> Your hard work and perseverance have paid off. Congratulations! </div>
                      <div className="flex justify-end gap-x-4">
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          onClick={() => {
                            handleChangeClose();
                          }}
                        >
                          {" "}
                          Continue{" "}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 items-center justify-center" >
                      <Lottie
                        loop
                        animationData={FailAnimation}
                        play
                        style={{ width: "80%" }}
                      />
                      <div className="text-3xl font-bold text-white"> Better Luck Next time </div>
                      <div className="flex justify-end gap-x-4">
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          onClick={() => {
                            setViewResults(() => true);
                          }}
                        >
                          {" "}
                          View Results{" "}
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </Box>
            </Box>
          </Modal>
        )}
      </>
    )
  );
}

QuizPage.propTypes = {
  id: PropTypes.number.isRequired,
  setValue: PropTypes.func.isRequired
};
