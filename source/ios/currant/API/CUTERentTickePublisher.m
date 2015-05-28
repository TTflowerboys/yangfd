//
//  CUTERentTickePublisher.m
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentTickePublisher.h"
#import <Bolts.h>
#import <Sequencer.h>
#import "CUTECommonMacro.h"
#import <NSArray+ObjectiveSugar.h>
#import "CUTETicket.h"
#import "CUTEImageUploader.h"
#import "CUTEAPIManager.h"
#import "NSURL+Assets.h"
#import "CUTEDataManager.h"

@interface CUTERentTickePublisher () {


}

@end


@implementation CUTERentTickePublisher

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });

    return sharedInstance;
}

- (BFTask *)createTicket:(CUTETicket *)ticket {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    Sequencer *sequencer = [Sequencer new];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[self createProperty:ticket.property] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [tcs setError:task.error];
            }
            else {
                CUTEProperty *property = task.result;
                ticket.property.identifier = property.identifier;
                completion(property);
            }
            return nil;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:ticket.toParams];
        [params setObject:@"true" forKey:@"user_generated"];
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/rent_ticket/add/" parameters:params resultClass:nil] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [tcs setError:task.error];
            }
            else if (task.exception) {
                [tcs setException:task.exception];
            }
            else if (task.isCancelled) {
                [tcs cancel];
            }
            else {
                completion(task.result);
            }
            return nil;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", result) parameters:nil resultClass:[CUTETicket class]] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [tcs setError:task.error];
            }
            else if (task.exception) {
                [tcs setException:task.exception];
            }
            else if (task.isCancelled) {
                [tcs cancel];
            }
            else {
                [tcs setResult:task.result];
            }
            return nil;
        }];
    }];

    [sequencer run];
    return tcs.task;
}

- (BFTask *)editTicketExcludeImage:(CUTETicket *)ticket {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    Sequencer *sequencer = [Sequencer new];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[self editProperty:ticket.property] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [tcs setError:task.error];
            }
            else if (task.exception) {
                [tcs setException:task.exception];
            }
            else if (task.isCancelled) {
                [tcs cancel];
            }
            else {
                CUTEProperty *property = task.result;
                ticket.property.identifier = property.identifier;
                completion(property);
            }

            return task;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:ticket.toParams];
        [params setObject:@"true" forKey:@"user_generated"];
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:params resultClass:[CUTETicket class]] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [tcs setError:task.error];
            }
            else if (task.exception) {
                [tcs setException:task.exception];
            }
            else if (task.isCancelled) {
                [tcs cancel];
            }
            else {
                CUTETicket *ticket = task.result;
                ticket.property = result;
                [tcs setResult:ticket];
            }
            return nil;
        }];
    }];

    [sequencer run];
    return tcs.task;
}

- (BFTask*)publishTicket:(CUTETicket *)ticket updateStatus:(void (^)(NSString *status))updateStatus
{
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    Sequencer *sequencer = [Sequencer new];

    if (!IsArrayNilOrEmpty([ticket.property realityImages])) {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            if (updateStatus) {
                updateStatus([NSString stringWithFormat:STR(@"正在上传图片(%d/%d)..."), 0, ticket.property.realityImages.count]);
            }
            [[self uploadImages:ticket.property.realityImages updateStatus:^(NSString *status) {
                updateStatus(status);
            }] continueWithBlock:^id(BFTask *task) {
                if (task.result) {
                    ticket.property.realityImages = task.result;
                    completion(task.result);
                }
                else {
                    [tcs setError:task.error];
                }
                return nil;
            }];
        }];
    }

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        if (updateStatus) {
            updateStatus(STR(@"正在发布房产..."));
        }
        [[self editProperty:ticket.property] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [tcs setError:task.error];
            }
            else if (task.exception) {
                [tcs setException:task.exception];
            }
            else if (task.isCancelled) {
                [tcs cancel];
            }
            else {
                CUTEProperty *property = task.result;
                ticket.property.identifier = property.identifier;
                completion(property);
            }
            return nil;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        if (updateStatus) {
            updateStatus(STR(@"正在发布房产出租单..."));
        }
        ticket.status = kTicketStatusToRent;
        NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:ticket.toParams];
        [params setObject:@"true" forKey:@"user_generated"];
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:params resultClass:[CUTETicket class]] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [tcs setError:task.error];
            }
            else if (task.exception) {
                [tcs setException:task.exception];
            }
            else if (task.isCancelled) {
                [tcs cancel];
            }
            else {
                CUTETicket *ticket = task.result;
                ticket.property = result;
                [tcs setResult:ticket];
            }
            return nil;
        }];
    }];

    [sequencer run];
    return tcs.task;
}

- (BFTask *)uploadImages:(NSArray *)images updateStatus:(void (^) (NSString *status))updateStatus {
    NSArray *tasks = [images map:^id(NSString *object) {
        if ([[NSURL URLWithString:object] isAssetURL]) {
            return [[CUTEImageUploader sharedInstance] uploadImageWithAssetURLString:object];
        }
        else {
            return [BFTask taskWithResult:object];
        }
    }];

    [tasks each:^(BFTask *task) {
        [task continueWithBlock:^id(BFTask *task) {
            if (updateStatus) {
                NSArray *completeTasks = [tasks select:^BOOL(BFTask *task) {
                    return task.isCompleted;
                }];
                updateStatus([NSString stringWithFormat:STR(@"正在上传图片(%d/%d)..."), completeTasks.count, tasks.count]);
            }
            return task;
        }];
    }];

    return [BFTask taskForCompletionOfAllTasksWithResults:tasks];
}

- (BFTask *)editTicket:(CUTETicket *)ticket updateStatus:(void (^)(NSString *))updateStatus {

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    CUTEProperty *property = ticket.property;
    if (property) {
        Sequencer *sequencer = [Sequencer new];
        if (!IsArrayNilOrEmpty([property realityImages])) {
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                [[self uploadImages:property.realityImages updateStatus:updateStatus] continueWithBlock:^id(BFTask *task) {
                    if (task.result) {
                        property.realityImages = task.result;
                        completion(task.result);
                    }
                    else {
                        [tcs setError:task.error];
                    }
                    return nil;
                }];
            }];
        }

        if (property && property.identifier) {
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                if (updateStatus) {
                    updateStatus(STR(@"正在更新房产..."));
                }
                NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:property.toParams];
                [params setObject:@"true" forKey:@"user_generated"];
                [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/property/", property.identifier, @"/edit") parameters:params resultClass:[CUTEProperty class]]  continueWithBlock:^id(BFTask *task) {
                    if (task.error) {
                        [tcs setError:task.error];
                    }
                    else if (task.exception) {
                        [tcs setException:task.exception];
                    }
                    else if (task.isCancelled) {
                        [tcs cancel];
                    }
                    else {
                        CUTEProperty *property = task.result;
                        ticket.property.identifier = property.identifier;
                        completion(property);
                    }
                      return nil;
                }];
            }];
        }

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            if (updateStatus) {
                updateStatus(STR(@"正在更新房产出租单..."));
            }
            NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:ticket.toParams];
            [params setObject:@"true" forKey:@"user_generated"];
            [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:params resultClass:[CUTETicket class]] continueWithBlock:^id(BFTask *task) {
                if (task.error) {
                    [tcs setError:task.error];
                }
                else if (task.exception) {
                    [tcs setException:task.exception];
                }
                else if (task.isCancelled) {
                    [tcs cancel];
                }
                else {
                    CUTETicket *ticket = task.result;
                    ticket.property = result;
                    [tcs setResult:ticket];
                }
                return nil;
            }];
        }];

        [sequencer run];
    }

    return tcs.task;
}

- (BFTask *)deleteTicket:(CUTETicket *)ticket {
    ticket.status = kTicketStatusDeleted;
    ticket.property.status = kPropertyStatusDeleted;
    return [BFTask taskForCompletionOfAllTasks:
            @[[self editProperty:ticket.property],
              [[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:ticket.toParams resultClass:nil]
              ]];
}

- (BFTask *)createProperty:(CUTEProperty *)property {
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:property.toParams];
    [params setObject:@"true" forKey:@"user_generated"];
    return [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/property/", @"none", @"/edit") parameters:params resultClass:nil] continueWithBlock:^id(BFTask *task) {
        if (task.error || task.exception || task.isCancelled) {
            return task;
        }
        else {
            if ([task.result isKindOfClass:[NSString class]]) {
                CUTEProperty *property = [CUTEProperty new];
                property.identifier = task.result;
                return [BFTask taskWithResult:property];
            }
            return task;
        }
    }];
}

- (BFTask *)editProperty:(CUTEProperty *)property {
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:property.toParams];
    [params setObject:@"true" forKey:@"user_generated"];
    return [[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/property/", property.identifier, @"/edit") parameters:params resultClass:[CUTEProperty class]];
}

- (BFTask *)syncTickets {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [[[CUTEAPIManager sharedInstance] GET:@"/api/1/rent_ticket/search" parameters:@{@"status": kTicketStatusDraft, @"sort": @"last_modified_time,desc", @"user_id":[CUTEDataManager sharedInstance].user.identifier} resultClass:[CUTETicket class]] continueWithBlock:^id(BFTask *task) {
        if (task.error) {
            [tcs setError:task.error];
        }
        else if (task.exception) {
            [tcs setException:task.exception];
        }
        else if (task.isCancelled) {
            [tcs cancel];
        }
        else {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(void) {

                NSArray *localTickets = [[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets];
                NSArray *remoteTickets = task.result;
                [remoteTickets each:^(CUTETicket *object) {
                    if ([object isKindOfClass:[CUTETicket class]] && object.property) {
                        CUTETicket *localTicket = [localTickets find:^BOOL(CUTETicket *localObject) {
                            return localObject.identifier == object.identifier;
                        }];
                        if (localTicket) {
                            if (!fequal(object.lastModifiedTime, localTicket.lastModifiedTime)) {
                                //merge
                                [object mergeValuesForKeysFromModel:localTicket];
                                [[CUTEDataManager sharedInstance] checkStatusAndSaveRentTicketToUnfinised:object];
                            }
                        }
                        else {
                            [[CUTEDataManager sharedInstance] checkStatusAndSaveRentTicketToUnfinised:object];
                        }
                    }
                }];
                NSArray *unfinishedRentTickets = [[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets];
                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    [tcs setResult:unfinishedRentTickets];
                });
            });
        }

        return task;
    }];

    return tcs.task;
}

@end
