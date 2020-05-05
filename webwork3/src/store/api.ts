import axios from "axios";

import login_store from "@/store/modules/login";

import {
  RenderedProblem,
  Problem,
  UserProblem,
  FileInfo,
  UserSetScore,
  UserSet,
  Dictionary,
  ProblemTags
} from "@/store/models";

// This renders a problem given by either a Problem or from a source.

export async function renderProblem(problem: Problem | Dictionary<string>) {
  const response = await axios.put(login_store.api_header + "/render", problem);
  return response.data as RenderedProblem;
}

export async function renderFromSource(pg_source: string) {
  const response = await axios.put(login_store.api_header + "/render", {
    problem_source: pg_source,
  });
  return response.data as RenderedProblem;
}

// This fetches the Problem Source from a path in a course.

export async function fetchProblemSource(source_file: string) {
  const response = await axios.get(
    login_store.api_header + "/library/fullproblem?source_file=" + source_file
  );
  return response.data as Problem;
}

// This renders a problem (probably not necessary)

export async function fetchProblem(_problem: Problem) {
  //console.log(props); // eslint-disable-line no-console
  const response = await axios.put(
    "/webwork3/api/courses/" + login_store.course_id + "/render/problems/0",
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
  return response.data as ProblemTags;
}

export async function fetchUserProblem(props: Dictionary<string>) {
  const response = await axios.get(
    login_store.api_header +
      "/users/" +
      props.user_id +
      "/sets/" +
      props.set_id +
      "/problems/" +
      props.problem_id
  );
  return response.data as UserProblem;
}

export async function fetchUserSet(props: Dictionary<string>) {
  const response = await axios.get(
    login_store.api_header + "/users/" + props.user_id + "/sets/" + props.set_id
  );
  return response.data as UserSet;
}

export async function fetchUserSets(props: Dictionary<string>) {
  const response = await axios.get(
    login_store.api_header + "/users/" + props.user_id + "/sets"
  );
  return response.data as UserSet[];
}
//
// export async function fetchUserSetScores(props: StringMap) {
//   const response = await axios.get(
//     login_store.api_header +
//       "/users/" +
//       props.user_id +
//       "/sets/" +
//       props.set_id +
//       "/scores"
//   );
//   return response.data as StringMap[];
// }

export async function submitUserProblem(props: Dictionary<string>) {
  const response = await axios.post(
    login_store.api_header +
      "/render/users/" +
      props.user_id +
      "/sets/" +
      props.set_id +
      "/problems/" +
      props.problem_id,
    props
  );
  return response.data as RenderedProblem;
}

export async function getLocalDirectory(path: string) {
  const response = await axios.get(
    login_store.api_header + "/local" + (path ? "/" + path : "")
  );
  return response.data as FileInfo[];
}

export async function fetchAllUserSetScores() {
  const response = await axios.get(login_store.api_header + "/usersetscores");
  return response.data as UserSetScore[];
}

export async function fetchSiteInfo() {
  const response = await axios.get("/webwork3/api/site-info");
  return response.data as { courses: string[]; site_info: string };
}
