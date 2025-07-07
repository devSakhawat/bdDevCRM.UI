// Sample Web API Controller for .NET Core 8 Web API project
// This would go in your API project under Controllers folder

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace bdDevCRM.API.Controllers
{
    [ApiController]
    [Route("bdDevs-crm/[controller]")]
    [Authorize] // Add authorization if needed
    public class CrmInstituteController : ControllerBase
    {
        private readonly ILogger<CrmInstituteController> _logger;
        private readonly IWebHostEnvironment _environment;
        // Add your services here (e.g., IRepository, IService, etc.)

        public CrmInstituteController(
            ILogger<CrmInstituteController> logger,
            IWebHostEnvironment environment)
        {
            _logger = logger;
            _environment = environment;
        }

        /// <summary>
        /// Creates a new CRM Institute
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateInstitute([FromForm] string modelDto, [FromForm] IFormFile? InstitutionLogoFile, [FromForm] IFormFile? InstitutionProspectusFile)
        {
            try
            {
                _logger.LogInformation("Creating new CRM Institute");

                // Deserialize the DTO
                var instituteDto = JsonSerializer.Deserialize<CrmInstituteDto>(modelDto, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (instituteDto == null)
                {
                    return BadRequest(new { 
                        IsSuccess = false, 
                        Message = "Invalid institute data",
                        ErrorType = "ValidationError"
                    });
                }

                // Validate required fields
                if (string.IsNullOrWhiteSpace(instituteDto.InstituteName))
                {
                    return BadRequest(new { 
                        IsSuccess = false, 
                        Message = "Institute Name is required",
                        ErrorType = "ValidationError"
                    });
                }

                if (instituteDto.CountryId <= 0)
                {
                    return BadRequest(new { 
                        IsSuccess = false, 
                        Message = "Country is required",
                        ErrorType = "ValidationError"
                    });
                }

                // Handle file uploads
                await HandleFileUploads(instituteDto, InstitutionLogoFile, InstitutionProspectusFile);

                // TODO: Add your business logic here
                // Example:
                // var createdInstitute = await _instituteService.CreateAsync(instituteDto);

                // For now, return success response
                return Ok(new { 
                    IsSuccess = true, 
                    Message = "Institute created successfully",
                    Data = new { InstituteId = 1, InstituteName = instituteDto.InstituteName } // Replace with actual data
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating CRM Institute");
                return StatusCode(500, new { 
                    IsSuccess = false, 
                    Message = "An unexpected error occurred",
                    ErrorType = "InternalServerError"
                });
            }
        }

        /// <summary>
        /// Updates an existing CRM Institute
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInstitute(int id, [FromForm] string modelDto, [FromForm] IFormFile? InstitutionLogoFile, [FromForm] IFormFile? InstitutionProspectusFile)
        {
            try
            {
                _logger.LogInformation($"Updating CRM Institute with ID: {id}");

                // Deserialize the DTO
                var instituteDto = JsonSerializer.Deserialize<CrmInstituteDto>(modelDto, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (instituteDto == null)
                {
                    return BadRequest(new { 
                        IsSuccess = false, 
                        Message = "Invalid institute data",
                        ErrorType = "ValidationError"
                    });
                }

                // Ensure ID matches
                instituteDto.InstituteId = id;

                // Handle file uploads
                await HandleFileUploads(instituteDto, InstitutionLogoFile, InstitutionProspectusFile);

                // TODO: Add your business logic here
                // Example:
                // var updatedInstitute = await _instituteService.UpdateAsync(id, instituteDto);

                return Ok(new { 
                    IsSuccess = true, 
                    Message = "Institute updated successfully",
                    Data = new { InstituteId = id, InstituteName = instituteDto.InstituteName }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating CRM Institute with ID: {id}");
                return StatusCode(500, new { 
                    IsSuccess = false, 
                    Message = "An unexpected error occurred",
                    ErrorType = "InternalServerError"
                });
            }
        }

        /// <summary>
        /// Gets a CRM Institute by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetInstitute(int id)
        {
            try
            {
                // TODO: Add your business logic here
                // Example:
                // var institute = await _instituteService.GetByIdAsync(id);
                
                // For now, return sample data
                var sampleInstitute = new CrmInstituteDto
                {
                    InstituteId = id,
                    InstituteName = "Sample Institute",
                    CountryId = 1,
                    Status = true
                };

                return Ok(new { 
                    IsSuccess = true, 
                    Data = sampleInstitute
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting CRM Institute with ID: {id}");
                return StatusCode(500, new { 
                    IsSuccess = false, 
                    Message = "An unexpected error occurred",
                    ErrorType = "InternalServerError"
                });
            }
        }

        /// <summary>
        /// Deletes a CRM Institute by ID
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInstitute(int id)
        {
            try
            {
                // TODO: Add your business logic here
                // Example:
                // await _instituteService.DeleteAsync(id);

                return Ok(new { 
                    IsSuccess = true, 
                    Message = "Institute deleted successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting CRM Institute with ID: {id}");
                return StatusCode(500, new { 
                    IsSuccess = false, 
                    Message = "An unexpected error occurred",
                    ErrorType = "InternalServerError"
                });
            }
        }

        /// <summary>
        /// Handles file uploads and sets the file paths in the DTO
        /// </summary>
        private async Task HandleFileUploads(CrmInstituteDto dto, IFormFile? logoFile, IFormFile? prospectusFile)
        {
            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "institutes");
            Directory.CreateDirectory(uploadsPath);

            // Handle logo file
            if (logoFile != null && logoFile.Length > 0)
            {
                var logoFileName = $"{Guid.NewGuid()}_{logoFile.FileName}";
                var logoFilePath = Path.Combine(uploadsPath, logoFileName);
                
                using (var stream = new FileStream(logoFilePath, FileMode.Create))
                {
                    await logoFile.CopyToAsync(stream);
                }
                
                dto.InstitutionLogo = $"/uploads/institutes/{logoFileName}";
            }

            // Handle prospectus file
            if (prospectusFile != null && prospectusFile.Length > 0)
            {
                var prospectusFileName = $"{Guid.NewGuid()}_{prospectusFile.FileName}";
                var prospectusFilePath = Path.Combine(uploadsPath, prospectusFileName);
                
                using (var stream = new FileStream(prospectusFilePath, FileMode.Create))
                {
                    await prospectusFile.CopyToAsync(stream);
                }
                
                dto.InstitutionProspectus = $"/uploads/institutes/{prospectusFileName}";
            }
        }
    }

    /// <summary>
    /// CRM Institute Data Transfer Object for API
    /// </summary>
    public class CrmInstituteDto
    {
        // --- PK & FK ---
        public int InstituteId { get; set; }
        public int CountryId { get; set; }
        public int? CurrencyId { get; set; }
        public int? InstituteTypeId { get; set; }

        // --- Basic Info ---
        public string InstituteName { get; set; } = null!;
        public string? InstituteCode { get; set; }
        public string? InstituteEmail { get; set; }
        public string? InstituteAddress { get; set; }
        public string? InstitutePhoneNo { get; set; }
        public string? InstituteMobileNo { get; set; }
        public string? Campus { get; set; }
        public string? Website { get; set; }

        // --- Financial / Visa ---
        public decimal? MonthlyLivingCost { get; set; }
        public decimal? FundsRequirementforVisa { get; set; }
        public decimal? ApplicationFee { get; set; }

        // --- Language & Academic ---
        public bool? IsLanguageMandatory { get; set; }
        public string? LanguagesRequirement { get; set; }

        // --- Descriptive Info ---
        public string? InstitutionalBenefits { get; set; }
        public string? PartTimeWorkDetails { get; set; }
        public string? ScholarshipsPolicy { get; set; }
        public string? InstitutionStatusNotes { get; set; }

        // --- File Path (DB) ---
        public string? InstitutionLogo { get; set; }
        public string? InstitutionProspectus { get; set; }

        // --- Status ---
        public bool? Status { get; set; }

        // --- Display Names ---
        public string? CountryName { get; set; }
        public string? CurrencyName { get; set; }
        public string? InstituteTypeName { get; set; }
    }
}