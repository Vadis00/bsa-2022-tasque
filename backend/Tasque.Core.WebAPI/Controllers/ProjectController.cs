﻿using Microsoft.AspNetCore.Mvc;
using Tasque.Core.BLL.Services;
using Tasque.Core.Common.DTO.Board;
using Tasque.Core.Common.DTO.Project;
using Tasque.Core.Common.DTO.Task;
using Tasque.Core.Identity.Helpers;

namespace Tasque.Core.WebAPI.Controllers;

[Route("api/project/")]
public class ProjectController : EntityController
    <NewProjectDto, ProjectInfoDto, EditProjectDto, int, ProjectService>
{
    private readonly int _userId;
    public ProjectController(ProjectService service, CurrentUserParameters userParams)
        : base(service)
    {
        _userId = userParams.Id;
    }

    [HttpGet("all/{organizationId}")]
    public async Task<IActionResult> GetAllProjectsOfOrganization(int organizationId)
    {
        return Ok(await _service.GetAllProjectsOfOrganization(organizationId));
    }

    [HttpGet("board/{projectId:int}")]
    public async Task<IActionResult> GetBoard(int projectId)
    {
        var res = await _service.GetProjectBoard(projectId);
        return Ok(res);
    }

    [HttpPut("board/tasks")]
    public async Task<IActionResult> UpdateBoardTasks(BoardInfoDto board)
    {
        var res = await _service.UpdateTasks(board);
        return Ok(res);
    }

    [HttpPut("board/columns")]
    public async Task<IActionResult> UpdateBoardColumns(BoardInfoDto board)
    {
        var res = await _service.UpdateColumns(board);
        return Ok(res);
    }

    [Route("current/{id}")]
    [HttpGet]
    public async Task<IActionResult> CurrentProjectInfo(int id)
    {
        var result = await _service.CurrentProjectInfo(id);

        return Ok(result);
    }

    [HttpGet("getByOrganizationId/{organizationId}")]
    public IActionResult GetProjectsByOrganizationId(int organizationId)
    {
        var projects = _service.GetProjectsByOrganizationId(organizationId);
        if (projects == null)
            return NotFound();
        return Ok(projects);
    }

    [HttpGet("getProjectPriorities/{projectId}")]
    public IActionResult GetProjectPriorities(int projectId)
    {
        var priorities = _service.GetProjectPrioritiesById(projectId);
        if (priorities == null)
            return NotFound("Project or it's task priorities not found");
        return Ok(priorities);
    }

    [HttpGet("getProjectStates/{projectId}")]
    public IActionResult GetProjectStates(int projectId)
    {
        var states = _service.GetProjectStatesById(projectId);
        if (states == null)
            return NotFound("Project or it's task states not found");
        return Ok(states);
    }

    [HttpGet("getProjectById/{projectId}")]
    public async Task<IActionResult> GetProjectById(int projectId)
    {
        var project = await _service.GetProjectById(projectId);
        if (project == null)
            return NotFound("Project not found");
        return Ok(project);
    }

    [HttpPut("taskPriorities/{projectId}")]
    public async Task<IActionResult> UpdateProjectTaskPriorities(int projectId, IEnumerable<TaskPriorityDto> taskPriorityDtos)
    {
        var res = await _service.UpdateProjectTaskPriorities(projectId, taskPriorityDtos);
        return Ok(res);
    }

    [HttpPut("taskStates/{projectId}")]
    public async Task<IActionResult> UpdateProjectTaskPriorities(int projectId, IEnumerable<TaskStateDto> taskStateDtos)
    {
        var res = await _service.UpdateProjectTaskStates(projectId, taskStateDtos);
        return Ok(res);
    }

    [HttpPut("taskTypes/{projectId}")]
    public async Task<IActionResult> UpdateProjectTaskTypes(int projectId, IEnumerable<TaskTypeDto> taskTypeDtos)
    {
        var res = await _service.UpdateProjectTaskTypes(projectId, taskTypeDtos);
        return Ok(res);
    }
}
