import { Types } from "mongoose";

export const convertObjectId = (id) => new Types.ObjectId(id);

export const Aggregate = {
    lookup: (pipelineStage) => ({ $lookup: pipelineStage }),
    match: (pipelineStage) => ({ $match: pipelineStage }),
    unwind: (pipelineStage) => ({ $unwind: pipelineStage }),
    addFields: (pipelineStage) => ({ $addFields: pipelineStage }),
    group: (pipelineStage) => ({ $group: pipelineStage }),
    facet: (pipelineStage) => ({ $facet: pipelineStage }),
    sort: (pipelineStage) => ({ $sort: pipelineStage }),
    limit: (pipelineStage) => ({ $limit: pipelineStage }),
    project: (pipelineStage) => ({ $project: pipelineStage }),
    skip: (pipelineStage) => ({ $skip: pipelineStage }),
    merge: (pipelineStage) => ({ $merge: pipelineStage }),
    replaceRoot: (pipelineStage) => ({ $replaceRoot: pipelineStage }),
};