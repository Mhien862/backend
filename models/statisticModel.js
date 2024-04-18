import mongoose from "mongoose";

const statisticSchema = mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true,
  },
  numberOfContributions: Number,
  percentageOfContribution: Number,
  numberOfContributors: Number,
  mostPopularIdeas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contribution",
    },
  ],
  mostViewedIdeas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contribution",
    },
  ],
  latestIdeas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contribution",
    },
  ],
  latestComments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

const Statistic = mongoose.model("Statistic", statisticSchema);

export default Statistic;
