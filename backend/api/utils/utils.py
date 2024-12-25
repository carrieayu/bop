from rest_framework import status
from rest_framework.response import Response
from django.db.models import Q

def check_for_existing_entries(data, model_class, fields_to_check):
    """
    Check for existing entries in the database based on the provided fields.
    Returns a list of existing model instances.
    """
    filters = Q()  # Initialize the Q object for dynamic filtering

    for field in fields_to_check:
        filters &= Q(**{f"{field}__in": [item.get(field) for item in data]})

    # Query the database once to get all matching entries based on the filters
    existing_entries = model_class.objects.filter(filters)
    
    return existing_entries

def generate_existing_entries_response(fields_to_check, existing_entries):
    """
    Generates a dynamic response for duplicate entries.

    :param fields_to_check: List of fields to check for duplicates.
    :param duplicate_entries: List of dictionaries containing duplicate field values.
    :return: Response with dynamic field and message.
    """
    field_combination = "_and_".join(fields_to_check)
    message = f"duplicateEntryFor{'And'.join([field.capitalize() for field in fields_to_check])}"  
    print(f'generate_existing_entries_response: message:{message}, field combination:{field_combination}')
    return Response(
        {
            "field": field_combination,
            "message": message,
            "existing_entries": existing_entries
        },
        status=status.HTTP_409_CONFLICT
    )

def check_data_is_list(data):  
    if not isinstance(data, list):
        return Response({"message": "Invalid input format. Expected a list."}, status=status.HTTP_400_BAD_REQUEST)

def initialize_response_containers():
    return {
        "responses": [],
        "error_responses": [],
        "duplicate_entries": []
    }

def validate_and_create_item(item, group_index, fields_to_check, serializer_class, partial=False):
    """
    Process individual item and return result.
    Returns a dictionary with status and response data.
    """
    print(f'item:{item},fields_to_check:{fields_to_check}')

    try:
        serializer = serializer_class(data=item, partial = partial)
        if serializer.is_valid():
            print('in serializer valid')
            serializer.save()
            field_values = [str(item[field]) for field in fields_to_check]
            print(f'field values {field_values}')
            message = f"Created successfully for {' and '.join([field.capitalize() + ' ' + value for field, value in zip(fields_to_check, field_values)])}"

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

# Used in Overwrite
def validate_and_process_item(serializer, item, group_index, action_type, dynamic_fields, responses, error_responses):
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

def validate_and_update_item(item, group_index, fields_to_check, identifier_field, model_class, serializer_class, partial=True):
    """
    Update any model object dynamically based on the identifier field and model class provided.
    Includes serializer validation and saving.
    """
    print(f'group_index{group_index}')
    try:
        # Ensure model_class and serializer_class are provided for dynamic updates
        if not model_class or not serializer_class:
            return {
                "status": "error",
                "response": {"group_index": group_index, "errors": {"non_field_error": ["Model class and serializer class are required"]}}
            }

        identifier_value = item.get(identifier_field)  # Get the identifier field value

        if not identifier_value:
            return {
                "status": "error",
                "response": {"group_index": group_index, "errors": {f"{identifier_field}": "This field is required."}}
            }

        # Fetch the object based on the identifier dynamically
        try:
            obj = model_class.objects.get(**{identifier_field: identifier_value})
        except model_class.DoesNotExist:
            return {
                "status": "error",
                "response": {"group_index": group_index, "errors": {f"{identifier_field}": f"{model_class.__name__} with this {identifier_field} does not exist."}}
            }
        # Exclude the identifier from the update data (do not send it in the update)
        update_data = {key: value for key, value in item.items() if key != identifier_field}

        # Use the serializer to validate the incoming data for the update
        serializer = serializer_class(obj, data=update_data, partial=partial)
        if serializer.is_valid():
            # Save the updated object
            serializer.save()

            # Generate a success message
            field_values = [str(item[field]) for field in fields_to_check]
            message = f"Updated successfully for {' and '.join([field.capitalize() + ' ' + value for field, value in zip(fields_to_check, field_values)])}"
            return {"status": "success", "response": {"message": message}}
        else:
            return {
                "status": "error",
                "response": {"group_index": group_index, "errors": serializer.errors}
            }

    except Exception as e:
        return {
            "status": "error",
            "response": {"group_index": group_index, "errors": {"non_field_error": [str(e)]}}
        }

# Generic response handling
def generate_error_response(error_responses):
    return Response({"errors": error_responses}, status=status.HTTP_400_BAD_REQUEST)


def generate_success_response(responses, action_types):
        print(f'action types: {action_types}')
     
        # Return UPDATE success response (for overwrite)
        if 'update' in action_types:
            status_code = status.HTTP_200_OK
        # Return CREATE success response
        if 'create' in action_types: 
            status_code = status.HTTP_201_CREATED

        return Response(responses, status_code)


def generate_deletion_response(status_code, message, error_message=None):
    print(f'in here utils deletion response')
    if error_message:
        return Response({"message": message, "error": error_message}, status=status_code)
    return Response({"message": message}, status=status_code)

# deletion responses
def generate_deletion_response_successful():
    print(f'in here utils deletion response SUCCESS')
    return Response({"message": "deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

def generate_deletion_response_not_found(record_type):
    return Response ({"message": f"{record_type} not found"},status= status.HTTP_404_NOT_FOUND)

def generate_response_failed(e):
    return Response({"message": "failed", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)