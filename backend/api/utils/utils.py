from django.http import JsonResponse
from rest_framework import status
from rest_framework.parsers import JSONParser

def check_duplicates(self, data, model, fields_to_check):
    """
    Check for duplicate entries in any model based on dynamic fields.

    :param data: List of incoming data items to check.
    :param model: The Django model to check for duplicates.
    :param fields: List of fields to check for duplicates (e.g., ['year', 'month']).
    :return: A list of duplicates or empty if no duplicates are found.
    """
    duplicate_entries = []
    for item in data:
        print(f'item:{item}, fields:{fields_to_check}, data:{data}')
        filter_kwargs = {field: item.get(field) for field in fields_to_check}
        print(f'filter_kwargs:{filter_kwargs}')

        if model.objects.filter(**filter_kwargs).exists():
            duplicate_entries.append({field: item.get(field) for field in fields_to_check})
    return duplicate_entries

def generate_duplicate_response(fields_to_check, existing_entries):
    """
    Generates a dynamic response for duplicate entries.

    :param fields_to_check: List of fields to check for duplicates.
    :param duplicate_entries: List of dictionaries containing duplicate field values.
    :return: JsonResponse with dynamic field and message.
    """
    field_combination = "_and_".join(fields_to_check)
    message = f"duplicateEntryFor{'And'.join([field.capitalize() for field in fields_to_check])}"  
    print(f'message:{message}, field combination:{field_combination}')
    return JsonResponse(
        {
            "field": field_combination,
            "message": message,
            "existing_entries": existing_entries
        },
        status=status.HTTP_409_CONFLICT
    )

def check_data_is_list(data):  
    if not isinstance(data, list):
        return JsonResponse({"message": "Invalid input format. Expected a list."}, status=status.HTTP_400_BAD_REQUEST)

def initialize_response_containers():
    return {
        "responses": [],
        "error_responses": [],
        "duplicate_entries": []
    }

def process_item(item, group_index, fields_to_check, serializer_class):
    """
    Process individual item and return result.
    Returns a dictionary with status and response data.
    """
    try:
        serializer = serializer_class(data=item)
        if serializer.is_valid():
            serializer.save()
            field_values = [str(item[field]) for field in fields_to_check]
            message = f"Created successfully for {' and '.join([field.capitalize() + ' ' + value for field, value in zip(fields_to_check, field_values)])}"
            print('in success')

            return {
                "status": "success",
                "response": {"message": message}
            }
        else:
            print('in error')
            return {
                "status": "error",
                "response": {"group_index": group_index, "errors": serializer.errors}
            }
    except Exception as e:
        print('in exception')

        return {
            "status": "error",
            "response": {"group_index": group_index, "errors": {"non_field_error": [str(e)]}}
        }

def get_existing_entry_id(self, item, model, fields_to_check):

    # for item in data:
    filter_conditions = {field: item.get(field) for field in fields_to_check}
    print(f'filter condiditons{filter_conditions}')

    existing_entry_id = model.objects.filter(**filter_conditions).first()
    
    return existing_entry_id

def handle_serializer_action(serializer, item, group_index, action_type, dynamic_fields, responses, error_responses):
    """
    Handle serializer action (either create or update) and append the appropriate message or errors.
    
    :param dynamic_fields: A list of fields to be used in message generation (like ['year', 'month']).
    """
    if serializer.is_valid():
        serializer.save()
        dynamic_field_values = ', '.join([f"{field}: {item.get(field)}" for field in dynamic_fields])
        responses.append({
            "message": f"{action_type.capitalize()} successfully for {dynamic_field_values}."
        })
    else:
        error_responses.append({
            "group_index": group_index,
            "errors": serializer.errors
        })