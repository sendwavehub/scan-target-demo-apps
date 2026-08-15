using AiSecStudio.Analysis.Abstractions;
using AiSecStudio.Parsing.Abstractions;
using AiSecStudio.Rules.Abstractions;

namespace SamplePlugin.HelloWorld;

/// <summary>
/// A demonstration analyzer contributed by the sample plugin. It flags a marker comment
/// (<c>// TODO-INSECURE</c>) in any C# source, purely to prove that a plugin-provided
/// <see cref="ICSharpSourceAnalyzer"/> runs in the host and returns host-typed findings across the
/// plugin load-context boundary. Real analyzers would parse and reason far more carefully.
/// </summary>
public sealed class HelloWorldAnalyzer : ICSharpSourceAnalyzer
{
    private const string Marker = "TODO-INSECURE";

    /// <inheritdoc />
    public IReadOnlyList<Finding> Analyze(IReadOnlyCollection<SourceFile> sources)
    {
        ArgumentNullException.ThrowIfNull(sources);

        var findings = new List<Finding>();
        foreach (var source in sources.Where(s => s.Path.EndsWith(".cs", StringComparison.OrdinalIgnoreCase)))
        {
            var lines = source.Text.Split('\n');
            for (var i = 0; i < lines.Length; i++)
            {
                if (lines[i].Contains(Marker, StringComparison.Ordinal))
                {
                    findings.Add(new Finding
                    {
                        RuleId = "sample.helloworld-marker",
                        Title = "Insecure TODO marker",
                        RiskLevel = RiskLevel.Low,
                        Confidence = Confidence.Possible,
                        Evidence = $"'{Marker}' marker in {source.Path}",
                        Reasoning = "The sample plugin flags an unresolved security TODO left in the source.",
                        Recommendation = "Resolve the TODO before shipping.",
                        Location = new FindingLocation(source.Path, i + 1),
                        Target = FindingTarget.File(source.Path),
                    });
                }
            }
        }

        return findings;
    }
}
