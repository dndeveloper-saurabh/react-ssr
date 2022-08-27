import React, { useContext, useState, useEffect } from "react";
import Lottie from "lottie-react-web";

import List from "@material-ui/core/List";
import Icon from "@material-ui/core/Icon";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ClassroomNestedLectureItem from "./components/nestedlectureitem";

import {
  ClassroomContext,
  PustackProContext,
  UserContext,
} from "../../../context";

import {
  CheckIcon as CheckIconImage,
  CheckIconGreen as CheckIconGreenImage,
  LockIcon as LockedIconImage,
  videoPlaying,
  NotesSVG,
} from "../../../assets";

const CheckIcon = () => (
  <Icon>
    <img
      src={CheckIconImage}
      alt="Check Icon"
      style={{ width: "100%" }}
      draggable={false}
    />
  </Icon>
);

const CheckGreenIcon = () => (
  <Icon>
    <img
      src={CheckIconGreenImage}
      alt="Check Icon"
      style={{ width: "100%" }}
      draggable={false}
    />
  </Icon>
);

const LockedIcon = () => (
  <Icon>
    <img
      src={LockedIconImage}
      alt="Lock Icon"
      style={{ width: "100%" }}
      draggable={false}
    />
  </Icon>
);

export default function ClassroomSidebarLectures({
  data,
  tabIndex,
  setVideoSeeking,
  videoSeeking,
}) {
  const [activeLecture, setActiveLecture] =
    useContext(ClassroomContext).activeItem;
  const [nextItem, setNextItem] = useContext(ClassroomContext).nextItem;
  const [classroomNotes] = useContext(ClassroomContext).notesLink;
  const [, setIsNotes] = useContext(ClassroomContext).isNotes;
  const [, setTabIndex] = useContext(ClassroomContext).tabIndex;
  const [playing, setPlaying] = useContext(ClassroomContext).playing;
  const [chapterEngagementMap] =
    useContext(ClassroomContext).chapterEngagementMap;
  const [, setLastEngagement] = useContext(ClassroomContext).lastEngagement;
  const [isUserProTier] = useContext(UserContext).tier;
  const [, setIsSliderOpen] = useContext(PustackProContext).value;
  const [, setLectureTier] = useContext(ClassroomContext).lectureTier;

  const [isExpanded, setIsExpanded] = useState(Array(data.length).fill(false));

  useEffect(() => {
    const boolExpanded = [];
    data.map(({ lecture_item_type, lecture_item_id }) => {
      return lecture_item_type === "header" &&
        lecture_item_id === activeLecture?.parent
        ? boolExpanded.push(true)
        : boolExpanded.push(false);
    });

    setIsExpanded([...boolExpanded]);
  }, [data, activeLecture]);

  const setExpanded = (idx) => {
    const booleanExpanded = [...isExpanded];

    booleanExpanded.map((_, index) =>
      index !== idx
        ? (booleanExpanded[index] = false)
        : (booleanExpanded[index] = !booleanExpanded[index])
    );

    setIsExpanded([...booleanExpanded]);
  };

  const isCompleted = (lectureId) => {
    const statusData = chapterEngagementMap?.lecture_engagement_status;

    if (statusData !== undefined) {
      return statusData[lectureId]?.is_completed;
    } else return false;
  };

  return (
    <div className="classroom__sidebar__tab dark">
      <List component="nav" aria-labelledby="nested-list-subheader">
        {data?.sort((a, b) =>
          a.serial_order > b.serial_order ? 1 : -1
        ).map((item, index) => {
          if (item?.lecture_header_items?.length > 0)
            return (
              <ClassroomNestedLectureItem
                title={item?.lecture_item_name}
                onClick={() => {
                  setExpanded(index);
                }}
                data={item?.lecture_header_items.sort((a, b) =>
                  a.serial_order > b.serial_order ? 1 : -1
                )}
                key={index}
                index={index}
                tabIndex={tabIndex}
                parent_id={item?.lecture_item_id}
                tier={item?.tier}
                isExpanded={isExpanded[index]}
                setVideoSeeking={setVideoSeeking}
                videoSeeking={videoSeeking}
              />
            );
          else if (item?.lecture_header_items?.length === 0)
            return (
              <ListItem
                onClick={() => {
                  if (item?.lecture_item_id !== activeLecture?.item) {
                    if (isUserProTier || item?.tier === "basic") {
                      setPlaying(false);
                      item?.lecture_item_id !== activeLecture?.item &&
                        setVideoSeeking(true);
                      setActiveLecture({
                        parent: null,
                        item: item?.lecture_item_id,
                      });
                      setNextItem({ ...nextItem, lectureType: "video" });

                      if (item?.tier === "pro") {
                        setLectureTier(true);
                      } else {
                        setLectureTier(false);
                      }

                      setLastEngagement({
                        lecture_type: item?.lecture_item_type,
                        lecture_header_item_index: -1,
                        lecture_item_index: index,
                        tab_index: tabIndex,
                      });
                      setTabIndex(tabIndex);
                    } else {
                      setIsSliderOpen(true);
                    }
                  }
                }}
                className={
                  item?.lecture_item_id === activeLecture?.item
                    ? "lecture___selected"
                    : ""
                }
                disabled={item?.lecture_item_id === activeLecture?.item}
                button
                key={index}
                style={{
                  background:
                    item?.lecture_item_id === activeLecture?.item
                      ? "rgb(50, 50, 50)"
                      : "none",
                }}
              >
                <ListItemIcon className="list__item__icon">
                  {isUserProTier ? (
                    isCompleted(item?.lecture_item_id) ? (
                      <CheckGreenIcon />
                    ) : (
                      <CheckIcon />
                    )
                  ) : item?.tier === "basic" ? (
                    isCompleted(item?.lecture_item_id) ? (
                      <CheckGreenIcon />
                    ) : (
                      <CheckIcon />
                    )
                  ) : (
                    <LockedIcon />
                  )}
                </ListItemIcon>

                <ListItemText primary={item?.lecture_item_name} />

                {item?.lecture_item_id === activeLecture?.item &&
                isUserProTier ? (
                  classroomNotes ? (
                    <button onClick={() => setIsNotes(true)}>
                      <img
                        className="notes__svg"
                        alt="PuStack Notes"
                        src={NotesSVG}
                      />
                    </button>
                  ) : (
                    <h5 className="video__seeking__lottie">
                      <Lottie
                        options={{ animationData: videoPlaying, loop: true }}
                        isPaused={!playing || videoSeeking}
                      />
                    </h5>
                  )
                ) : (
                  item?.lecture_item_id === activeLecture?.item && (
                    <h5 className="video__seeking__lottie">
                      <Lottie
                        options={{ animationData: videoPlaying, loop: true }}
                        isPaused={!playing || videoSeeking}
                      />
                    </h5>
                  )
                )}
              </ListItem>
            );
        })}
      </List>
    </div>
  );
}
