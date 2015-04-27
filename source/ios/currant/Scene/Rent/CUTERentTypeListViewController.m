//
//  CUTERentTypeListViewController.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentTypeListViewController.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTERentTypeListForm.h"
#import "CUTEFormDefaultCell.h"
#import "CUTEDataManager.h"
#import "CUTEEnumManager.h"
#import "CUTETicket.h"
#import "CUTERentTypeListForm.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTECommonMacro.h"
#import "CUTERentTickePublisher.h"
#import "SVProgressHUD+CUTEAPI.h"

@interface CUTERentTypeListViewController ()
{
    CUTERentTickePublisher *_publisher;
}

@end




@implementation CUTERentTypeListViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        [self.formController registerDefaultFieldCellClass:[CUTEFormDefaultCell class]];
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"房产类型");
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTERentTypeListForm *form = (CUTERentTypeListForm *)[self.formController form];
    if (self.singleUseForReedit) {
        self.ticket.rentType = [form rentTypeAtIndex:indexPath.row];
        [self.navigationController popViewControllerAnimated:YES];
    }
    else  {
        if (!self.ticket) {
            [SVProgressHUD show];
            if (!_publisher) {
                _publisher = [CUTERentTickePublisher new];
            }
            [[_publisher createTicket] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else {
                    [SVProgressHUD dismiss];
                    self.ticket = task.result;
                    self.ticket.rentType = [form rentTypeAtIndex:indexPath.row];
                    CUTERentAddressMapViewController *mapController = [CUTERentAddressMapViewController new];
                    mapController.ticket = self.ticket;
                    [self.navigationController pushViewController:mapController animated:YES];
                }
                return nil;
            }];
        }
    }
}

@end
