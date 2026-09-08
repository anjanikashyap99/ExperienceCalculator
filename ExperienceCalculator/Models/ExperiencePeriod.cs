using System.ComponentModel.DataAnnotations;

namespace ExperienceCalculator.Models
{
    public class ExperiencePeriod
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "Start month is required")]
        [Range(1, 12, ErrorMessage = "Please select a valid start month")]
        public int StartMonth { get; set; }

        [Required(ErrorMessage = "Start year is required")]
        [Range(1950, 2100, ErrorMessage = "Please enter a valid start year")]
        public int StartYear { get; set; }

        public int? EndMonth { get; set; }

        public int? EndYear { get; set; }

        public bool IsCurrentJob { get; set; }
    }
}
