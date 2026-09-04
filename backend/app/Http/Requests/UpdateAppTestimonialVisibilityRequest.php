/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 17:36:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:36:00
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppTestimonialVisibilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_published' => ['required', 'boolean'],
        ];
    }
}
