import axios from "axios";

import login_store from "@/store/modules/login";

import { StringMap } from "@/common";

import {
  RenderedProblem,
  Problem,
  FileInfo,
  UserSetScore,
} from "@/store/models";

// This renders a problem given by either a Problem or from a source.

export async function renderProblem(problem: Problem | StringMap) {
  const response = await axios.put(
    login_store.api_header + "/renderer",
    problem
  );
  return response.data as RenderedProblem;
}

export async function renderFromSource(pg_source: string) {
  const response = await axios.put(login_store.api_header + "/renderer", {
    problem_source: pg_source,
  });
  return response.data as RenderedProblem;
}

// This fetches the Problem Source from a path in a course.

export async function fetchProblemSource(source_file: string) {
  const response = await axios.get(
    login_store.api_header + "/library/fullproblem?source_file=" + source_file
  );
  return response.data as StringMap;
}

// This renders a problem (probably not necessary)

export async function fetchProblem(_problem: Problem) {
  //console.log(props); // eslint-disable-line no-console
  const response = await axios.put(
    "/webwork3/api/renderer/courses/" + login_store.course_id + "/problems/0",
    { problem: _problem }
  );
  return response.data as RenderedProblem;
}

export async function fetchProblemTags(path: string) {
  const response = await axios.get(
    "/webwork3/api/library/courses/" +
      login_store.login_info.course_id +
      "/problems/tags/" +
      path
  );
  return response.data as StringMap;
}

export async function getLocalDirectory(path: string) {
  const response = await axios.get(
    login_store.api_header + "/local" + (path ? "/" + path : "")
  );
  return response.data as FileInfo[];
}

export async function fetchUserSetScores() {
  const response = await axios.get(login_store.api_header + "/usersetscores");
  return response.data as UserSetScore[];
}
