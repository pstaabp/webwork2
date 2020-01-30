import axios from 'axios';

import login_store from '@/store/modules/login';

import {RenderedProblem, Problem, FileInfo, UserSetScore} from '@/store/models';

export async function renderProblem(problem: Problem) {
  const response = await axios.post('/webwork3/api/renderer', {source: problem.problem_source});
  return response.data as RenderedProblem;
}

export async function getLocalDirectory(path: string) {
  const response = await axios.get(login_store.api_header + '/local' + (path ? '/' + path : ''));
  return response.data as FileInfo[];
}

export async function fetchUserSetScores() {
  const response = await axios.get(login_store.api_header + '/usersetscores');
  return response.data as UserSetScore [];
}
