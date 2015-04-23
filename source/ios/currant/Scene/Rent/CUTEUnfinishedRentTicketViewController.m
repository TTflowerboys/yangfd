//
//  CUTEUnfinishedRentTicketViewController.m
//  currant
//
//  Created by Foster Yin on 4/22/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUnfinishedRentTicketViewController.h"
#import "CUTECommonMacro.h"
#import "CUTERentTypeListViewController.h"
#import "CUTERentTypeListForm.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEEnumManager.h"
#import "CUTETicket.h"
#import "CUTEDataManager.h"
#import "CUTEPropertyInfoViewController.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTEUnfinishedRentTicketCell.h"

@interface CUTEUnfinishedRentTicketViewController ()

@property (strong, nonatomic) NSArray *unfinishedRentTickets;

@end



@implementation CUTEUnfinishedRentTicketViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithImage:IMAGE(@"nav-add") style:UIBarButtonItemStylePlain target:self action:@selector(onAddButtonPressed:)];
    self.navigationItem.title = STR(@"未完成文档");
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    self.unfinishedRentTickets = [[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets];
    [self.tableView reloadData];
}

- (void)onAddButtonPressed:(id)sender {
    [SVProgressHUD show];
    [[[CUTEEnumManager sharedInstance] getEnumsByType:@"rent_type"] continueWithBlock:^id(BFTask *task) {
        if (task.result) {
            [SVProgressHUD dismiss];
            CUTERentTypeListForm *form = [[CUTERentTypeListForm alloc] init];
            [form setRentTypeList:task.result];
            CUTERentTypeListViewController *controller = [CUTERentTypeListViewController new];
            controller.formController.form = form;
            [self.navigationController pushViewController:controller animated:YES];

        }
        else {
            [SVProgressHUD showErrorWithError:task.error];
        }
        return nil;
    }];
}

#pragma mark - UITableViewDataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.unfinishedRentTickets.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTEUnfinishedRentTicketCell *cell = [tableView dequeueReusableCellWithIdentifier:@"ticketCell"];
    if (!cell) {
        cell = [[CUTEUnfinishedRentTicketCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"ticketCell"];
        cell.backgroundColor = RANDOMCOLOR;
    }
    CUTETicket *ticket = [self.unfinishedRentTickets objectAtIndex:indexPath.row];
    [cell updateWithTicket:ticket];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTETicket *ticket = [self.unfinishedRentTickets objectAtIndex:indexPath.row];
    if (ticket) {
        [[[CUTEEnumManager sharedInstance] getEnumsByType:@"property_type"] continueWithBlock:^id(BFTask *task) {
            if (!IsArrayNilOrEmpty(task.result)) {
                CUTEPropertyInfoViewController *controller = [[CUTEPropertyInfoViewController alloc] init];
                controller.ticket = ticket;
                CUTEPropertyInfoForm *form = [CUTEPropertyInfoForm new];
                form.propertyType = ticket.property.propertyType;
                form.bedroom = ticket.property.bedroomCount;
                [form setAllPropertyTypes:task.result];
                controller.formController.form = form;
                [self.navigationController pushViewController:controller animated:YES];
            }
            else {
                [SVProgressHUD showErrorWithError:task.error];
            }

            return nil;
        }];
    }

}

@end
