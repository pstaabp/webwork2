import axios from "axios";

import { getModule } from "vuex-module-decorators";

import login_module from "@/store/modules/login";
const login_store = getModule(login_module);

import {
  RenderedProblem,
  Problem,
  UserProblem,
  FileInfo,
  UserSetScore,
  UserSet,
  Dictionary,
  ProblemTags,
} from "@/store/models";

// This renders a problem given by either a Problem or from a source.

export async function renderProblem(
  problem: Problem | Dictionary<string>
): Promise<RenderedProblem> {
  const response = await axios.put(login_store.api_header + "/render", problem);
  return response.data as RenderedProblem;
}

export async function renderFromSource(
  pg_source: string
): Promise<RenderedProblem> {
  const response = await axios.put(login_store.api_header + "/render", {
    problem_source: pg_source,
  });
  return response.data as RenderedProblem;
}

// This fetches the Problem Source from a path in a course.

export async function fetchProblemSource(
  source_file: string
): Promise<Problem> {
  const response = await axios.get(
    login_store.api_header + "/library/fullproblem?source_file=" + source_file
  );
  return response.data as Problem;
}

// This renders a problem (probably not necessary)

export async function fetchProblem(
  _problem: Problem
): Promise<RenderedProblem> {
  //console.log(props); // eslint-disable-line no-console
  const response = await axios.put(
    "/webwork3/api/courses/" + login_store.course_id + "/render/problems/0",
    { problem: _problem }
  );
  return response.data as RenderedProblem;
}

export async function fetchProblemTags(path: string): Promise<ProblemTags> {
  const response = await axios.get(
    "/webwork3/api/library/courses/" +
      login_store.login_info.course_id +
      "/problems/tags/" +
      path
  );
  return response.data as ProblemTags;
}

export async function fetchUserProblem(
  props: Dictionary<string>
): Promise<UserProblem> {
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

export async function fetchUserSet(
  props: Dictionary<string>
): Promise<UserSet> {
  const response = await axios.get(
    login_store.api_header + "/users/" + props.user_id + "/sets/" + props.set_id
  );
  return response.data as UserSet;
}

export async function fetchUserSets(
  props: Dictionary<string>
): Promise<UserSet[]> {
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

export async function submitUserProblem(
  props: Dictionary<string>
): Promise<RenderedProblem> {
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

export async function getLocalDirectory(path: string): Promise<FileInfo[]> {
  const response = await axios.get(
    login_store.api_header + "/local" + (path ? "/" + path : "")
  );
  return response.data as FileInfo[];
}

export async function fetchAllUserSetScores(): Promise<UserSetScore[]> {
  const response = await axios.get(login_store.api_header + "/usersetscores");
  return response.data as UserSetScore[];
}

interface SiteInfo {
  courses: string[];
  site_info: string;
}

export async function fetchSiteInfo(): Promise<SiteInfo> {
  const response = await axios.get("/webwork3/api/site-info");
  return response.data as SiteInfo;
}

interface TemplateType {
  raw_source: string;
}

// export async function fetchProblemSource(prob: Problem) {
//   const response = await axios.get(login_store.api_header + "/library/fullproblem", {
//       params: prob,
//     });
//   return response.data as {problem_source: string};
//
// }

export async function fetchProblemTemplate(
  _type: string
): Promise<TemplateType> {
  const response = await axios.get(
    login_store.api_header + "/problem-templates/" + _type
  );
  return response.data as TemplateType;
}
